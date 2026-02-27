<template>
    <div class="orderplan-manager" :class="'mode-' + viewMode">
        <!-- ═══════════ STICKY TOP BAR ═══════════ -->
        <div class="top-bar" :class="'top-bar--' + viewMode">
            <div class="top-bar-left">
                <div class="top-bar-info">
                    <div class="top-bar-title-row">
                        <h2 class="top-bar-title">{{ topBarTitle }}</h2>
                        <span class="mode-badge" :class="'mode-badge--' + viewMode">{{ modeBadgeLabel }}</span>
                    </div>
                    <p class="top-bar-subtitle">{{ topBarSubtitle }}</p>
                </div>
            </div>
            <div class="top-bar-actions">
                <template v-if="viewMode === 'preview'">
                    <button type="button" class="btn-delete" :class="{ 'btn-delete--confirm': deleteConfirmPending, 'btn--attempting': pendingAction === 'delete' }" :disabled="isAttempting" @click="handleDelete">
                        <span v-if="pendingAction === 'delete'" class="spinner"></span>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {{ pendingAction === 'delete' ? 'Attempting...' : (deleteConfirmPending ? 'Confirm Delete?' : 'Delete') }}
                    </button>
                    <button type="button" class="btn-edit" :disabled="isAttempting" @click="enterEditMode">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Plan
                    </button>
                </template>
                <template v-else>
                    <button v-if="viewMode === 'editing'" type="button" class="btn-delete" :class="{ 'btn-delete--confirm': deleteConfirmPending, 'btn--attempting': pendingAction === 'delete' }" :disabled="isAttempting" @click="handleDelete">
                        <span v-if="pendingAction === 'delete'" class="spinner"></span>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        {{ pendingAction === 'delete' ? 'Attempting...' : (deleteConfirmPending ? 'Confirm Delete?' : 'Delete') }}
                    </button>
                    <button v-if="viewMode === 'editing'" type="button" class="btn-nevermind" :disabled="isAttempting" @click="handleNevermind">Nevermind</button>
                    <button type="button" class="btn-draft" :class="{ 'btn--attempting': pendingAction === 'save_draft' }" :disabled="isAttempting" @click="handleSaveDraft">
                        <span v-if="pendingAction === 'save_draft'" class="spinner"></span>
                        {{ pendingAction === 'save_draft' ? 'Attempting...' : 'Save Draft' }}
                    </button>
                    <button type="button" class="btn-submit" :class="{ 'btn--attempting': pendingAction === 'submit' }" :disabled="isAttempting" @click="handleSubmit">
                        <span v-if="pendingAction === 'submit'" class="spinner"></span>
                        {{ pendingAction === 'submit' ? 'Attempting...' : 'Submit for Processing' }}
                    </button>
                </template>
            </div>
        </div>

        <!-- ═══════════ FAILED TOAST ═══════════ -->
        <div v-if="actionFailed" class="action-failed-bar" @click="handleRetry">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span class="action-failed-text">{{ actionFailedLabel }} failed.</span>
            <span class="action-failed-retry">Click to try again</span>
        </div>

        <!-- ═══════════ SCROLLABLE CONTENT ═══════════ -->
        <div class="form-content">

            <!-- ── SECTION 1: ORDER METADATA ── -->
            <section class="form-section">
                <h3 class="section-heading">
                    <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Order Metadata
                </h3>
                <div class="meta-card">
                    <div class="meta-grid">
                        <div class="meta-field meta-field--full">
                            <label class="field-label">Order Plan Title</label>
                            <input type="text" class="field-input" v-model="formTitle" placeholder="e.g., Summer Campaign 2024" :disabled="isReadOnly" />
                        </div>
                        <div class="meta-field">
                            <label class="field-label">Quote Reference</label>
                            <input type="text" class="field-input" v-model="formQuoteRef" placeholder="Q-202X-XXX" :disabled="isReadOnly" />
                        </div>
                        <div class="meta-field">
                            <label class="field-label">Invoice Reference</label>
                            <input type="text" class="field-input" v-model="formInvoiceRef" placeholder="INV-202X-XXX" :disabled="isReadOnly" />
                        </div>
                        <div class="meta-field">
                            <label class="field-label">PIC (BDA)</label>
                            <div class="custom-select" ref="picBdaSelectEl">
                                <button type="button" class="select-trigger" :class="{ 'has-value': !!formPicBda }" :disabled="isReadOnly" @click="toggleDropdown('picBda')">
                                    <span class="select-text">{{ picBdaDisplay }}</span>
                                    <span class="select-chevron">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                    </span>
                                </button>
                                <ul v-if="openDropdown === 'picBda'" class="select-options">
                                    <li class="select-search-wrap" @mousedown.prevent>
                                        <input ref="picBdaSearchInput" v-model="picBdaSearch" type="text" class="select-search-input" placeholder="Search teammate..." @keydown.stop />
                                    </li>
                                    <li class="select-option select-option--placeholder" @mousedown.prevent="selectPicBda(null)">Select Teammate...</li>
                                    <li v-for="t in filteredTeammatesBda" :key="t.id" class="select-option" @mousedown.prevent="selectPicBda(t)">{{ t.name }}</li>
                                    <li v-if="filteredTeammatesBda.length === 0 && picBdaSearch.trim()" class="select-option select-option--empty">No matches</li>
                                </ul>
                            </div>
                        </div>
                        <div class="meta-field">
                            <label class="field-label">PIC (OPS)</label>
                            <div class="custom-select" ref="picOpsSelectEl">
                                <button type="button" class="select-trigger" :class="{ 'has-value': !!formPicOps }" :disabled="isReadOnly" @click="toggleDropdown('picOps')">
                                    <span class="select-text">{{ picOpsDisplay }}</span>
                                    <span class="select-chevron">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                    </span>
                                </button>
                                <ul v-if="openDropdown === 'picOps'" class="select-options">
                                    <li class="select-search-wrap" @mousedown.prevent>
                                        <input ref="picOpsSearchInput" v-model="picOpsSearch" type="text" class="select-search-input" placeholder="Search teammate..." @keydown.stop />
                                    </li>
                                    <li class="select-option select-option--placeholder" @mousedown.prevent="selectPicOps(null)">Select Teammate...</li>
                                    <li v-for="t in filteredTeammatesOps" :key="t.id" class="select-option" @mousedown.prevent="selectPicOps(t)">{{ t.name }}</li>
                                    <li v-if="filteredTeammatesOps.length === 0 && picOpsSearch.trim()" class="select-option select-option--empty">No matches</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── SECTION 2: DELIVERY LOGISTICS ── -->
            <section class="form-section">
                <div class="section-heading-row">
                    <h3 class="section-heading">
                        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        Delivery Logistics
                    </h3>
                    <button v-if="!isReadOnly" type="button" class="btn-add-location" @click="addDelivery">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Location
                    </button>
                </div>
                <div class="deliveries-grid">
                    <div v-for="(del, dIdx) in formDeliveries" :key="del._uid" class="delivery-card">
                        <button v-if="!isReadOnly && formDeliveries.length > 1" type="button" class="btn-remove-delivery" @click="removeDelivery(dIdx)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                        <div class="delivery-card-header">
                            <div class="delivery-index">{{ dIdx + 1 }}</div>
                            <input v-if="!isReadOnly" type="text" class="delivery-label-input" v-model="del.label" placeholder="Location Name" />
                            <span v-else class="delivery-label-static">{{ del.label || 'Unnamed Location' }}</span>
                        </div>
                        <div class="delivery-fields">
                            <div class="delivery-row-2col">
                                <div class="delivery-field">
                                    <label class="field-label-sm">Type</label>
                                    <select class="field-select" v-model="del.deliverytype" :disabled="isReadOnly">
                                        <option v-for="dt in DELIVERY_TYPES" :key="dt" :value="dt">{{ dt }}</option>
                                    </select>
                                </div>
                                <div class="delivery-field">
                                    <label class="field-label-sm">Deadline</label>
                                    <input type="datetime-local" class="field-input-sm" v-model="del.deadline" :disabled="isReadOnly" />
                                </div>
                            </div>
                            <div class="delivery-field">
                                <label class="field-label-sm">Address</label>
                                <textarea class="field-textarea" v-model="del.address" rows="2" placeholder="Full delivery address..." :disabled="isReadOnly"></textarea>
                            </div>
                            <div class="delivery-field">
                                <label class="field-label-sm">Remarks</label>
                                <input type="text" class="field-input-sm" v-model="del.remarks" placeholder="Optional notes..." :disabled="isReadOnly" />
                            </div>
                            <div class="delivery-row-2col">
                                <div class="delivery-field">
                                    <label class="field-label-sm">Contact Name</label>
                                    <input type="text" class="field-input-sm" v-model="del.pic_name" placeholder="Contact person" :disabled="isReadOnly" />
                                </div>
                                <div class="delivery-field">
                                    <label class="field-label-sm">Contact Phone</label>
                                    <input type="text" class="field-input-sm" v-model="del.pic_phone" placeholder="Phone number" :disabled="isReadOnly" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── SECTION 3: ATTACHED BOOKINGS & ALLOCATIONS ── -->
            <section class="form-section">
                <div class="section-heading-row">
                    <h3 class="section-heading">
                        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        Attached Bookings
                    </h3>
                    <div v-if="!isReadOnly" class="booking-connect-wrap" ref="bookingConnectEl">
                        <button type="button" class="btn-connect-booking" @click="toggleDropdown('bookingConnect')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Connect Booking
                        </button>
                        <div v-if="openDropdown === 'bookingConnect'" class="booking-dropdown">
                            <div class="booking-dropdown-search">
                                <input ref="bookingSearchInput" v-model="bookingSearch" type="text" class="select-search-input" placeholder="Search by BN number or title..." @keydown.stop autofocus />
                            </div>
                            <div class="booking-dropdown-list">
                                <button v-for="bh in filteredBookingHeaders" :key="bh.id" type="button" class="booking-dropdown-item" :class="{ 'is-attached': attachedBookingIds.has(bh.id) }" :disabled="attachedBookingIds.has(bh.id)" @click="attachBooking(bh)">
                                    <div class="booking-dropdown-item-info">
                                        <span class="booking-bn">{{ bh.bookingnumber }}</span>
                                        <span class="booking-title-label">{{ bh.bookingtitle }}</span>
                                    </div>
                                    <svg v-if="attachedBookingIds.has(bh.id)" class="booking-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                    <svg v-else class="booking-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </button>
                                <div v-if="filteredBookingHeaders.length === 0" class="booking-dropdown-empty">
                                    {{ bookingSearch.trim() ? 'No matching bookings' : 'No bookings available' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="formAttachedBookings.length === 0" class="bookings-empty">
                    <svg class="bookings-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <p class="bookings-empty-text">No bookings connected yet.</p>
                    <p v-if="!isReadOnly" class="bookings-empty-hint">Connect a booking to start planning allocations.</p>
                </div>

                <!-- Booking blocks -->
                <div v-for="(ab, abIdx) in formAttachedBookings" :key="ab.booking_headerid" class="booking-block">
                    <div class="booking-block-header">
                        <div class="booking-block-header-info">
                            <span class="booking-block-bn">{{ getBookingNumber(ab.booking_headerid) }}</span>
                            <span class="booking-block-title">{{ getBookingTitle(ab.booking_headerid) }}</span>
                        </div>
                        <button v-if="!isReadOnly" type="button" class="btn-detach-booking" @click="detachBooking(abIdx)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>

                    <div class="booking-items-list">
                        <div v-for="item in getBookingItems(ab.booking_headerid)" :key="item.id" class="sku-block">
                            <div class="sku-info-row">
                                <img v-if="getInventoryField(item.sku, 'imagelink')" :src="getInventoryField(item.sku, 'imagelink')" :alt="getInventoryField(item.sku, 'model')" class="sku-thumb" />
                                <div v-else class="sku-thumb-placeholder">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                                </div>
                                <div class="sku-details">
                                    <div class="sku-model">{{ getInventoryField(item.sku, 'model') || 'Unknown Item' }}</div>
                                    <div class="sku-variant">{{ getInventoryField(item.sku, 'color') || '-' }} · {{ item.sku }}</div>
                                </div>
                                <div class="sku-allocation-summary" :class="allocationStatusClass(ab.booking_headerid, item.id, item.quantity)">
                                    <span class="sku-allocated-count">{{ getAllocatedTotal(ab.booking_headerid, item.id) }}</span>
                                    <span class="sku-total-count">/ {{ item.quantity }}</span>
                                    <span class="sku-alloc-label">Allocated</span>
                                </div>
                            </div>

                            <div class="alloc-table">
                                <div class="alloc-table-head">
                                    <span class="alloc-th alloc-th-qty">Quantity</span>
                                    <span class="alloc-th alloc-th-dest">Destination</span>
                                    <span class="alloc-th alloc-th-cust">Customization & Mockup</span>
                                    <span class="alloc-th alloc-th-labor">Labor</span>
                                    <span v-if="!isReadOnly" class="alloc-th alloc-th-action">Action</span>
                                </div>
                                <div class="alloc-table-body">
                                    <template v-for="(alloc, aIdx) in getAllocations(ab.booking_headerid, item.id)" :key="alloc._uid">
                                        <div class="alloc-row" :class="{ 'alloc-row--split': getAllocations(ab.booking_headerid, item.id).length > 1, 'alloc-row--readonly': isReadOnly }">
                                            <div class="alloc-cell alloc-cell-qty">
                                                <input type="number" class="alloc-qty-input" :value="alloc.quantity_assigned" min="0" :disabled="isReadOnly" @input="updateAllocationQty(ab.booking_headerid, item.id, aIdx, $event.target.value)" />
                                                <span v-if="getAllocations(ab.booking_headerid, item.id).length > 1" class="alloc-split-label">Split #{{ aIdx + 1 }}</span>
                                            </div>
                                            <div class="alloc-cell alloc-cell-dest">
                                                <select class="alloc-select" :value="alloc.deliveries_headerid" :disabled="isReadOnly" @change="updateAllocationField(ab.booking_headerid, item.id, aIdx, 'deliveries_headerid', $event.target.value)">
                                                    <option v-for="d in formDeliveries" :key="d._uid" :value="d._uid">{{ d.label || 'Unnamed Location' }}</option>
                                                </select>
                                                <span class="alloc-dest-type">{{ getDeliveryType(alloc.deliveries_headerid) }}</span>
                                            </div>
                                            <div class="alloc-cell alloc-cell-cust">
                                                <select class="alloc-select" :value="alloc.customization" :disabled="isReadOnly" @change="updateAllocationField(ab.booking_headerid, item.id, aIdx, 'customization', $event.target.value)">
                                                    <option v-for="c in customizationOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
                                                </select>
                                                <input v-if="alloc.customization && alloc.customization !== 'None'" type="text" class="alloc-mockup-input" placeholder="Paste mockup link..." :value="alloc.mockupLink" :disabled="isReadOnly" @input="updateAllocationField(ab.booking_headerid, item.id, aIdx, 'mockupLink', $event.target.value)" />
                                            </div>
                                            <div class="alloc-cell alloc-cell-labor">
                                                <select class="alloc-select" :value="alloc.labor || ''" :disabled="isReadOnly" @change="setLabor(ab.booking_headerid, item.id, aIdx, $event.target.value)">
                                                    <option v-for="lo in laborOptions" :key="lo.value" :value="lo.value">{{ lo.label }}</option>
                                                </select>
                                            </div>
                                            <div v-if="!isReadOnly" class="alloc-cell alloc-cell-action">
                                                <button type="button" class="btn-split" :class="{ 'btn-split--disabled': alloc.quantity_assigned < 2 }" :disabled="alloc.quantity_assigned < 2" title="Split Quantity" @click="handleSplit(ab.booking_headerid, item.id, aIdx)">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
                                                </button>
                                                <button v-if="getAllocations(ab.booking_headerid, item.id).length > 1" type="button" class="btn-remove-alloc" title="Remove Split" @click="removeAllocation(ab.booking_headerid, item.id, aIdx)">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

const DELIVERY_TYPES = ['Klang Valley', 'West Malaysia', 'East Malaysia', 'Singapore', 'Self Pickup'];
const DEFAULT_CUSTOMIZATION_OPTIONS = [
    { label: 'None', value: 'None' },
    { label: 'UV 1 Logo', value: 'UV 1 Logo' },
    { label: 'UV 2 Logos', value: 'UV 2 Logos' },
    { label: 'UV 360', value: 'UV 360' },
    { label: 'Laser Engraving', value: 'Laser Engraving' },
    { label: 'Deboss', value: 'Deboss' },
];
const DEFAULT_LABOR_OPTIONS = [
    { label: 'None', value: '' },
    { label: 'Box Sleeving', value: 'sleeving' },
    { label: 'Standard Gift Box', value: 'giftbox' },
    { label: 'Gift Box + Addons', value: 'giftbox_addons' },
];

function generateUid() {
    try { return wwLib.wwUtils.getUid(); } catch { return 'uid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9); }
}
function generateNewOpid() {
    const now = Date.now();
    const rand = Math.floor(Math.random() * 100);
    const n = (now * 100 + rand) % 1000000;
    return 'OP-' + String(n).padStart(6, '0');
}
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
function toDatetimeLocal(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function makeDefaultDelivery(label) {
    return { _uid: generateUid(), _existingId: null, label: label || 'Main Office', deliverytype: 'Klang Valley', address: '', remarks: '', pic_name: '', pic_phone: '', deadline: '' };
}
function makeDefaultAllocation(deliveryUid, quantity, splitgroupid) {
    return { _uid: generateUid(), _existingId: null, quantity_assigned: quantity, deliveries_headerid: deliveryUid, customization: 'None', mockupLink: '', labor: null, splitgroupid: splitgroupid || generateUid() };
}

export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['trigger-event'],
    setup(props, { emit }) {
        const resolvedBookingHeaders = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.bookingHeaders) || []);
        const resolvedBookingItems = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.bookingItems) || []);
        const resolvedInventoryData = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.inventoryData) || []);
        const resolvedTeammates = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.teammatesList) || []);
        const resolvedOpHeaders = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanHeadersData) || []);
        const resolvedOpDeliveries = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanDeliveriesData) || []);
        const resolvedOpAttBookings = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanAttBookingsData) || []);
        const resolvedOpLines = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanLinesData) || []);

        const customizationOptions = computed(() => {
            const raw = props.content?.customizationOptions;
            const arr = Array.isArray(raw) ? raw : [];
            return arr.length > 0 ? arr : DEFAULT_CUSTOMIZATION_OPTIONS;
        });
        const laborOptions = computed(() => {
            const raw = props.content?.laborOptions;
            const arr = Array.isArray(raw) ? raw : [];
            return arr.length > 0 ? arr : DEFAULT_LABOR_OPTIONS;
        });

        const editingHeaderId = computed(() => props.content?.editingHeaderId || '');
        const actionStatus = computed(() => {
            const v = props.content?.actionStatus;
            if (!v || typeof v !== 'string') return null;
            const s = v.trim().toLowerCase();
            if (s === 'successful' || s === 'failed') return s;
            return null;
        });

        // ── Action tracking: null | 'save_draft' | 'submit' | 'delete' ──
        const pendingAction = ref(null);
        const actionFailed = ref(false);
        const actionFailedLabel = ref('');

        // ── View mode: 'preview' | 'editing' | 'creating' ──
        const viewMode = ref('creating');
        const isReadOnly = computed(() => viewMode.value === 'preview');

        const topBarTitle = computed(() => {
            if (viewMode.value === 'preview') return formTitle.value || 'Order Plan';
            if (viewMode.value === 'editing') return 'Edit Order Plan';
            return 'Create Order Plan';
        });
        const topBarSubtitle = computed(() => {
            if (viewMode.value === 'preview') return formOpid.value ? `${formOpid.value}` : 'Preview';
            if (viewMode.value === 'editing') return `Editing ${formTitle.value || 'Untitled'}`;
            return 'Draft mode';
        });
        const modeBadgeLabel = computed(() => {
            if (viewMode.value === 'preview') return 'Preview';
            if (viewMode.value === 'editing') return 'Editing';
            return 'New';
        });

        function enterEditMode() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            viewMode.value = 'editing';
        }

        // ── Lookup maps ──
        const inventoryLookup = computed(() => { const m = {}; for (const r of resolvedInventoryData.value) m[r.sku] = r; return m; });
        const bookingHeadersLookup = computed(() => { const m = {}; for (const h of resolvedBookingHeaders.value) m[h.id] = h; return m; });
        const bookingItemsByHeader = computed(() => { const m = {}; for (const i of resolvedBookingItems.value) { if (!m[i.headerid]) m[i.headerid] = []; m[i.headerid].push(i); } return m; });
        const bookingItemLookup = computed(() => { const m = {}; for (const i of resolvedBookingItems.value) m[i.id] = i; return m; });

        // ── Form state ──
        const formTitle = ref('');
        const formQuoteRef = ref('');
        const formInvoiceRef = ref('');
        const formPicBda = ref(null);
        const formPicBdaName = ref('');
        const formPicOps = ref(null);
        const formPicOpsName = ref('');
        const formOpid = ref('');
        const formDeliveries = ref([makeDefaultDelivery('Main Office')]);
        const formAttachedBookings = ref([]);
        const formAllocations = reactive({});
        const originalData = ref(null);
        const lastLoadedHeaderId = ref(null);

        // ── Dropdown state ──
        const openDropdown = ref(null);
        const picBdaSearch = ref('');
        const picOpsSearch = ref('');
        const bookingSearch = ref('');
        const picBdaSelectEl = ref(null);
        const picOpsSelectEl = ref(null);
        const bookingConnectEl = ref(null);
        const picBdaSearchInput = ref(null);
        const picOpsSearchInput = ref(null);
        const bookingSearchInput = ref(null);

        const attachedBookingIds = computed(() => new Set(formAttachedBookings.value.map(ab => ab.booking_headerid)));

        const filteredTeammatesBda = computed(() => {
            const q = picBdaSearch.value.trim().toLowerCase();
            if (!q) return resolvedTeammates.value;
            return resolvedTeammates.value.filter(t => (t.name || '').toLowerCase().includes(q));
        });
        const filteredTeammatesOps = computed(() => {
            const q = picOpsSearch.value.trim().toLowerCase();
            if (!q) return resolvedTeammates.value;
            return resolvedTeammates.value.filter(t => (t.name || '').toLowerCase().includes(q));
        });
        const filteredBookingHeaders = computed(() => {
            const q = bookingSearch.value.trim().toLowerCase();
            if (!q) return resolvedBookingHeaders.value;
            return resolvedBookingHeaders.value.filter(h => ((h.bookingnumber || '').toLowerCase().includes(q) || (h.bookingtitle || '').toLowerCase().includes(q)));
        });

        const picBdaDisplay = computed(() => formPicBdaName.value || 'Select Teammate...');
        const picOpsDisplay = computed(() => formPicOpsName.value || 'Select Teammate...');

        function getBookingNumber(hId) { return bookingHeadersLookup.value[hId]?.bookingnumber || ''; }
        function getBookingTitle(hId) { return bookingHeadersLookup.value[hId]?.bookingtitle || ''; }
        function getInventoryField(sku, field) { return inventoryLookup.value[sku]?.[field] || ''; }
        function getBookingItems(bhId) { return bookingItemsByHeader.value[bhId] || []; }
        function getDeliveryType(uid) { const d = formDeliveries.value.find(dd => dd._uid === uid); return d ? d.deliverytype : ''; }

        function allocKey(bhId, biId) { return `${bhId}::${biId}`; }
        function getAllocations(bhId, biId) { return formAllocations[allocKey(bhId, biId)] || []; }
        function getAllocatedTotal(bhId, biId) { let s = 0; for (const a of getAllocations(bhId, biId)) s += (parseInt(a.quantity_assigned) || 0); return s; }
        function allocationStatusClass(bhId, biId, qty) { const a = getAllocatedTotal(bhId, biId); if (a > qty) return 'alloc-over'; if (a === qty) return 'alloc-full'; return 'alloc-partial'; }

        function toggleDropdown(name) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            if (isReadOnly.value) return;
            if (openDropdown.value === name) { openDropdown.value = null; return; }
            openDropdown.value = name;
            if (name === 'picBda') { picBdaSearch.value = ''; nextTick(() => picBdaSearchInput.value?.focus()); }
            if (name === 'picOps') { picOpsSearch.value = ''; nextTick(() => picOpsSearchInput.value?.focus()); }
            if (name === 'bookingConnect') { bookingSearch.value = ''; nextTick(() => bookingSearchInput.value?.focus()); }
        }
        function selectPicBda(t) { if (t) { formPicBda.value = t.id; formPicBdaName.value = t.name; } else { formPicBda.value = null; formPicBdaName.value = ''; } openDropdown.value = null; }
        function selectPicOps(t) { if (t) { formPicOps.value = t.id; formPicOpsName.value = t.name; } else { formPicOps.value = null; formPicOpsName.value = ''; } openDropdown.value = null; }

        const dropdownRefs = { picBda: picBdaSelectEl, picOps: picOpsSelectEl, bookingConnect: bookingConnectEl };
        function handleClickOutside(e) { const a = openDropdown.value; if (!a) return; const el = dropdownRefs[a]; if (el?.value && !el.value.contains(e.target)) openDropdown.value = null; }
        onMounted(() => document.addEventListener('mousedown', handleClickOutside));
        onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside));

        function addDelivery() { /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */ formDeliveries.value.push(makeDefaultDelivery('New Location')); }
        function removeDelivery(idx) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            if (formDeliveries.value.length <= 1) return;
            const uid = formDeliveries.value[idx]._uid;
            formDeliveries.value.splice(idx, 1);
            const fb = formDeliveries.value[0]._uid;
            for (const k in formAllocations) { const arr = formAllocations[k]; if (!Array.isArray(arr)) continue; for (const a of arr) { if (a.deliveries_headerid === uid) a.deliveries_headerid = fb; } }
        }

        function attachBooking(bh) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            if (attachedBookingIds.value.has(bh.id)) return;
            formAttachedBookings.value.push({ _existingId: null, booking_headerid: bh.id });
            const items = getBookingItems(bh.id);
            const fuid = formDeliveries.value[0]?._uid || '';
            for (const item of items) formAllocations[allocKey(bh.id, item.id)] = [makeDefaultAllocation(fuid, item.quantity || 0)];
            openDropdown.value = null;
        }
        function detachBooking(idx) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            const r = formAttachedBookings.value[idx]; if (!r) return;
            for (const item of getBookingItems(r.booking_headerid)) delete formAllocations[allocKey(r.booking_headerid, item.id)];
            formAttachedBookings.value.splice(idx, 1);
        }

        function updateAllocationQty(bhId, biId, aIdx, raw) { /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */ const arr = formAllocations[allocKey(bhId, biId)]; if (!arr?.[aIdx]) return; arr[aIdx].quantity_assigned = Math.max(0, parseInt(raw) || 0); }
        function updateAllocationField(bhId, biId, aIdx, f, v) { /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */ const arr = formAllocations[allocKey(bhId, biId)]; if (!arr?.[aIdx]) return; arr[aIdx][f] = v; }
        function setLabor(bhId, biId, aIdx, val) { /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */ const arr = formAllocations[allocKey(bhId, biId)]; if (!arr?.[aIdx]) return; arr[aIdx].labor = val || null; }
        function handleSplit(bhId, biId, aIdx) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            const arr = formAllocations[allocKey(bhId, biId)]; if (!arr?.[aIdx]) return;
            const o = arr[aIdx]; if (o.quantity_assigned < 2) return;
            const h1 = Math.floor(o.quantity_assigned / 2), h2 = o.quantity_assigned - h1;
            o.quantity_assigned = h1;
            const na = makeDefaultAllocation(o.deliveries_headerid, h2, o.splitgroupid);
            na.customization = o.customization; na.mockupLink = o.mockupLink; na.labor = o.labor || null;
            arr.splice(aIdx + 1, 0, na);
        }
        function removeAllocation(bhId, biId, aIdx) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            const arr = formAllocations[allocKey(bhId, biId)]; if (!arr || arr.length <= 1) return;
            const dq = arr[aIdx].quantity_assigned; arr.splice(aIdx, 1);
            arr[aIdx > 0 ? aIdx - 1 : 0].quantity_assigned += dq;
        }

        function buildPayload(action) {
            const hId = editingHeaderId.value || null;
            const status = action === 'request_process' ? 'Submitted' : 'Draft';
            const now = new Date().toISOString();
            const orderplan_headers = { id: hId, opid: hId ? formOpid.value : generateNewOpid(), title: formTitle.value || null, pic_bda: formPicBda.value || null, pic_ops: formPicOps.value || null, quoteref: formQuoteRef.value || null, invoiceref: formInvoiceRef.value || null, status, updated_at: now };
            if (!hId) orderplan_headers.created_at = now;
            if (action === 'request_process') orderplan_headers.submitted_at = now;
            const orderplan_attbookings = formAttachedBookings.value.map(ab => ({ id: ab._existingId || null, headerid: hId, booking_headerid: ab.booking_headerid }));
            const uidToDb = {};
            const orderplan_deliveries = formDeliveries.value.map(d => { const db = d._existingId || null; uidToDb[d._uid] = db; return { id: db, headerid: hId, label: d.label || null, deliverytype: d.deliverytype || null, address: d.address || null, remarks: d.remarks || null, pic_name: d.pic_name || null, pic_phone: d.pic_phone || null, deadline: d.deadline || null, _uid: d._uid }; });
            const orderplan_lines = [];
            for (const k in formAllocations) { const arr = formAllocations[k]; if (!Array.isArray(arr)) continue; const biId = k.split('::')[1]; for (const a of arr) { orderplan_lines.push({ id: a._existingId || null, headerid: hId, bookingitems_headerid: biId, deliveries_headerid: uidToDb[a.deliveries_headerid] || null, _deliveries_uid: a.deliveries_headerid, customization: a.customization === 'None' ? null : a.customization, quantity_assigned: a.quantity_assigned, splitgroupid: a.splitgroupid, mockup_link: a.mockupLink || null, labor: a.labor || null }); } }
            const changes = computeChanges(orderplan_headers, orderplan_attbookings, orderplan_deliveries, orderplan_lines);
            return { action, orderplan_headers, orderplan_attbookings, orderplan_deliveries, orderplan_lines, changes };
        }

        function computeChanges(headers, attBookings, deliveries, lines) {
            if (!originalData.value) return {};
            const orig = originalData.value; const changes = {};
            const hf = ['opid', 'title', 'pic_bda', 'pic_ops', 'quoteref', 'invoiceref']; const hc = {};
            for (const f of hf) { if (headers[f] !== (orig.headers[f] ?? null)) hc[f] = { from: orig.headers[f] ?? null, to: headers[f] }; }
            if (Object.keys(hc).length) changes.orderplan_headers = hc;
            const obIds = new Set(orig.attBookings.map(b => b.booking_headerid)); const nbIds = new Set(attBookings.map(b => b.booking_headerid));
            const ab_add = attBookings.filter(b => !obIds.has(b.booking_headerid)); const ab_rm = orig.attBookings.filter(b => !nbIds.has(b.booking_headerid));
            if (ab_add.length || ab_rm.length) changes.orderplan_attbookings = { added: ab_add, removed: ab_rm };
            const odIds = new Set(orig.deliveries.map(d => d.id).filter(Boolean)); const cdIds = new Set(deliveries.map(d => d.id).filter(Boolean));
            const d_add = deliveries.filter(d => !d.id); const d_rm = orig.deliveries.filter(d => d.id && !cdIds.has(d.id)); const d_mod = deliveries.filter(d => d.id && odIds.has(d.id));
            if (d_add.length || d_rm.length || d_mod.length) changes.orderplan_deliveries = { added: d_add, removed: d_rm, modified: d_mod };
            const olIds = new Set(orig.lines.map(l => l.id).filter(Boolean)); const clIds = new Set(lines.map(l => l.id).filter(Boolean));
            const l_add = lines.filter(l => !l.id); const l_rm = orig.lines.filter(l => l.id && !clIds.has(l.id));
            if (l_add.length || l_rm.length) changes.orderplan_lines = { added: l_add, removed: l_rm };
            return changes;
        }

        const deleteConfirmPending = ref(false);
        let deleteConfirmTimer = null;
        const isAttempting = computed(() => !!pendingAction.value);

        const ACTION_LABELS = { save_draft: 'Save Draft', submit: 'Submit', delete: 'Delete' };

        function fireAction(actionName, eventName, payload) {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            if (pendingAction.value) return;
            actionFailed.value = false;
            pendingAction.value = actionName;
            emit('trigger-event', { name: eventName, event: { value: payload } });
        }

        function handleSaveDraft() { fireAction('save_draft', 'onSaveDraft', buildPayload('save_draft')); }
        function handleSubmit() { fireAction('submit', 'onSubmitProcessing', buildPayload('request_process')); }
        function handleDelete() {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            if (pendingAction.value) return;
            if (!deleteConfirmPending.value) {
                deleteConfirmPending.value = true;
                clearTimeout(deleteConfirmTimer);
                deleteConfirmTimer = setTimeout(() => { deleteConfirmPending.value = false; }, 3000);
                return;
            }
            clearTimeout(deleteConfirmTimer);
            deleteConfirmPending.value = false;
            fireAction('delete', 'onDelete', { headerId: editingHeaderId.value || null, opid: formOpid.value || null, title: formTitle.value || null });
        }
        function handleNevermind() {
            /* wwEditor:start */ if (props.wwEditorState?.isEditing) return; /* wwEditor:end */
            const hId = editingHeaderId.value;
            if (hId) { populateFromExisting(hId); viewMode.value = 'preview'; }
        }
        function handleRetry() {
            actionFailed.value = false;
            pendingAction.value = null;
        }

        function completeAction(action) {
            if (action === 'save_draft') viewMode.value = 'preview';
        }

        watch(actionStatus, (newStatus) => {
            if (!pendingAction.value) return;
            if (newStatus === 'successful') {
                const completed = pendingAction.value;
                pendingAction.value = null;
                actionFailed.value = false;
                completeAction(completed);
            } else if (newStatus === 'failed') {
                actionFailedLabel.value = ACTION_LABELS[pendingAction.value] || 'Action';
                pendingAction.value = null;
                actionFailed.value = true;
            }
        });

        function populateFromExisting(headerId) {
            const header = resolvedOpHeaders.value.find(h => h.id === headerId); if (!header) return;
            formOpid.value = header.opid || ''; formTitle.value = header.title || ''; formQuoteRef.value = header.quoteref || ''; formInvoiceRef.value = header.invoiceref || '';
            formPicBda.value = header.pic_bda || null; formPicOps.value = header.pic_ops || null;
            if (header.pic_bda) { const tm = resolvedTeammates.value.find(t => t.id === header.pic_bda); formPicBdaName.value = tm ? tm.name : ''; }
            if (header.pic_ops) { const tm = resolvedTeammates.value.find(t => t.id === header.pic_ops); formPicOpsName.value = tm ? tm.name : ''; }
            const deliveries = resolvedOpDeliveries.value.filter(d => d.headerid === headerId);
            if (deliveries.length > 0) { formDeliveries.value = deliveries.map(d => ({ _uid: d.id || generateUid(), _existingId: d.id || null, label: d.label || '', deliverytype: d.deliverytype || 'Klang Valley', address: d.address || '', remarks: d.remarks || '', pic_name: d.pic_name || '', pic_phone: d.pic_phone || '', deadline: toDatetimeLocal(d.deadline) })); }
            else { formDeliveries.value = [makeDefaultDelivery('Main Office')]; }
            const dIdToUid = {}; for (const d of formDeliveries.value) { if (d._existingId) dIdToUid[d._existingId] = d._uid; }
            const attBookings = resolvedOpAttBookings.value.filter(ab => ab.headerid === headerId);
            formAttachedBookings.value = attBookings.map(ab => ({ _existingId: ab.id || null, booking_headerid: ab.booking_headerid }));
            for (const k in formAllocations) delete formAllocations[k];
            const lines = resolvedOpLines.value.filter(l => l.headerid === headerId);
            const lbi = {}; let unresolved = false;
            for (const l of lines) { const bi = bookingItemLookup.value[l.bookingitems_headerid]; if (!bi) { unresolved = true; continue; } const k = allocKey(bi.headerid, l.bookingitems_headerid); if (!lbi[k]) lbi[k] = []; lbi[k].push({ _uid: generateUid(), _existingId: l.id || null, quantity_assigned: l.quantity_assigned || 0, deliveries_headerid: dIdToUid[l.deliveries_headerid] || formDeliveries.value[0]?._uid || '', customization: l.customization || 'None', mockupLink: l.mockup_link || '', labor: l.labor || null, splitgroupid: l.splitgroupid || generateUid() }); }
            for (const k in lbi) formAllocations[k] = lbi[k];
            if (unresolved && Object.keys(lbi).length === 0 && lines.length > 0) { originalData.value = null; return; }
            const fuid = formDeliveries.value[0]?._uid || '';
            for (const ab of formAttachedBookings.value) { for (const item of getBookingItems(ab.booking_headerid)) { const k = allocKey(ab.booking_headerid, item.id); if (!formAllocations[k]) formAllocations[k] = [makeDefaultAllocation(fuid, item.quantity || 0)]; } }
            originalData.value = { headers: { opid: header.opid || '', title: header.title || '', pic_bda: header.pic_bda || null, pic_ops: header.pic_ops || null, quoteref: header.quoteref || '', invoiceref: header.invoiceref || '' }, attBookings: attBookings.map(ab => ({ booking_headerid: ab.booking_headerid })), deliveries: deliveries.map(d => ({ id: d.id, label: d.label, deliverytype: d.deliverytype, address: d.address, remarks: d.remarks, pic_name: d.pic_name, pic_phone: d.pic_phone, deadline: d.deadline })), lines: lines.map(l => ({ id: l.id, bookingitems_headerid: l.bookingitems_headerid, deliveries_headerid: l.deliveries_headerid, customization: l.customization, quantity_assigned: l.quantity_assigned, splitgroupid: l.splitgroupid })) };
        }

        function resetForm() {
            formOpid.value = ''; formTitle.value = ''; formQuoteRef.value = ''; formInvoiceRef.value = '';
            formPicBda.value = null; formPicBdaName.value = ''; formPicOps.value = null; formPicOpsName.value = '';
            formDeliveries.value = [makeDefaultDelivery('Main Office')]; formAttachedBookings.value = [];
            for (const k in formAllocations) delete formAllocations[k]; originalData.value = null;
        }

        watch(editingHeaderId, (newId) => {
            if (newId === lastLoadedHeaderId.value) return;
            lastLoadedHeaderId.value = newId;
            if (newId) { viewMode.value = 'preview'; populateFromExisting(newId); }
            else { viewMode.value = 'creating'; resetForm(); }
        }, { immediate: true });

        watch([resolvedOpHeaders, resolvedOpDeliveries, resolvedOpAttBookings, resolvedOpLines, resolvedBookingItems], () => {
            const hId = editingHeaderId.value;
            if (hId && !originalData.value) { const h = resolvedOpHeaders.value.find(r => r.id === hId); if (h) populateFromExisting(hId); }
        });

        return {
            DELIVERY_TYPES, customizationOptions, laborOptions,
            viewMode, isReadOnly, topBarTitle, topBarSubtitle, modeBadgeLabel, enterEditMode,
            formTitle, formQuoteRef, formInvoiceRef, formPicBda, formPicOps, formOpid,
            formDeliveries, formAttachedBookings, formAllocations, attachedBookingIds,
            openDropdown, picBdaSearch, picOpsSearch, bookingSearch,
            picBdaSelectEl, picOpsSelectEl, bookingConnectEl, picBdaSearchInput, picOpsSearchInput, bookingSearchInput,
            filteredTeammatesBda, filteredTeammatesOps, filteredBookingHeaders, picBdaDisplay, picOpsDisplay,
            getBookingNumber, getBookingTitle, getInventoryField, getBookingItems, getDeliveryType,
            getAllocations, getAllocatedTotal, allocationStatusClass,
            toggleDropdown, selectPicBda, selectPicOps, addDelivery, removeDelivery,
            attachBooking, detachBooking, updateAllocationQty, updateAllocationField, setLabor,
            handleSplit, removeAllocation, handleSaveDraft, handleSubmit, handleDelete, handleNevermind, handleRetry,
            deleteConfirmPending, pendingAction, isAttempting, actionFailed, actionFailedLabel,
        };
    },
};
</script>

<style lang="scss" scoped>
$blue: #3b82f6;
$blue-dark: #2563eb;
$blue-50: #eff6ff;
$red: #ef4444;
$red-dark: #dc2626;
$red-50: #fef2f2;
$green: #059669;
$green-light: #d1fae5;
$amber: #f59e0b;
$amber-50: #fffbeb;
$gray-900: #111827;
$gray-800: #1e293b;
$gray-700: #374151;
$gray-600: #475569;
$gray-500: #6b7280;
$gray-400: #9ca3af;
$gray-300: #d1d5db;
$gray-200: #e5e7eb;
$gray-100: #f3f4f6;
$gray-50: #f9fafb;
$white: #ffffff;
$bg: #f0f0f0;
$radius: 10px;
$radius-sm: 6px;
$radius-xs: 4px;
$transition: 0.15s ease;
$font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

.orderplan-manager { display: flex; flex-direction: column; width: 100%; min-height: 100%; background: $bg; font-family: $font; font-size: 12px; color: $gray-900; }

/* ═══ TOP BAR ═══ */
.top-bar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; background: $white; border-bottom: 1px solid $gray-200; flex-shrink: 0; transition: background $transition, border-color $transition; }
.top-bar--preview { background: $white; border-bottom: 1px solid $gray-200; }
.top-bar--editing { background: $white; border-bottom: 2px solid $amber; }
.top-bar--creating { background: $white; border-bottom: 2px solid $blue; }
.top-bar-left { display: flex; align-items: center; gap: 12px; }
.top-bar-info { display: flex; flex-direction: column; }
.top-bar-title-row { display: flex; align-items: center; gap: 8px; }
.top-bar-title { font-size: 14px; font-weight: 700; margin: 0; line-height: 1.3; color: $gray-900; }
.top-bar-subtitle { font-size: 11px; color: $gray-500; margin: 0; }
.top-bar-actions { display: flex; gap: 8px; }

/* ═══ MODE BADGE ═══ */
.mode-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; }
.mode-badge--preview { background: $gray-100; color: $gray-500; }
.mode-badge--editing { background: $amber-50; color: $amber; }
.mode-badge--creating { background: $blue-50; color: $blue; }

/* ═══ BUTTONS ═══ */
.btn-delete { display: flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: $font; color: $red; background: $white; border: 1px solid $gray-300; border-radius: $radius-sm; cursor: pointer; transition: all $transition; svg { width: 14px; height: 14px; } &:hover { color: $white; background: $red; border-color: $red; } }
.btn-delete--confirm { color: $white; background: $red; border-color: $red; animation: pulse-red 1s infinite; &:hover { background: $red-dark; border-color: $red-dark; } }
@keyframes pulse-red { 0%, 100% { box-shadow: 0 0 0 0 rgba($red, 0.4); } 50% { box-shadow: 0 0 0 4px rgba($red, 0.15); } }
.btn-edit { display: flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: $font; color: $white; background: $amber; border: none; border-radius: $radius-sm; cursor: pointer; transition: background $transition; svg { width: 14px; height: 14px; } &:hover { background: darken($amber, 8%); } }
.btn-nevermind { padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: $font; color: $gray-500; background: transparent; border: 1px solid $gray-300; border-radius: $radius-sm; cursor: pointer; transition: all $transition; &:hover { color: $gray-700; background: $gray-100; border-color: $gray-400; } }
.btn-draft { padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: $font; color: $gray-700; background: $white; border: 1px solid $gray-300; border-radius: $radius-sm; cursor: pointer; transition: all $transition; &:hover { background: $gray-50; border-color: $gray-400; } }
.btn-submit { padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: $font; color: $white; background: $gray-900; border: none; border-radius: $radius-sm; cursor: pointer; transition: background $transition; &:hover { background: $gray-800; } }

/* ═══ ATTEMPTING STATE ═══ */
.btn--attempting { opacity: 0.7; cursor: wait; pointer-events: none; display: flex; align-items: center; gap: 6px; }
.btn-draft:disabled, .btn-submit:disabled, .btn-edit:disabled, .btn-nevermind:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: currentColor; border-radius: 50%; animation: spin 0.6s linear infinite; flex-shrink: 0; }
.btn-draft .spinner { border: 2px solid rgba(0,0,0,0.1); border-top-color: $gray-600; }
.btn-nevermind .spinner { border: 2px solid rgba(0,0,0,0.1); border-top-color: $gray-500; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ═══ FAILED TOAST ═══ */
.action-failed-bar { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: $red-50; border-bottom: 1px solid rgba($red, 0.15); cursor: pointer; transition: background $transition; &:hover { background: darken($red-50, 2%); } svg { width: 16px; height: 16px; color: $red; flex-shrink: 0; } }
.action-failed-text { font-size: 12px; font-weight: 600; color: $red-dark; }
.action-failed-retry { font-size: 11px; color: $red; text-decoration: underline; margin-left: auto; }

/* ═══ FORM CONTENT ═══ */
.form-content { flex: 1; max-width: 960px; width: 100%; margin: 0 auto; padding: 24px 20px 60px; display: flex; flex-direction: column; gap: 28px; }
.form-section { display: flex; flex-direction: column; gap: 12px; }
.section-heading { font-size: 11px; font-weight: 700; color: $gray-500; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; display: flex; align-items: center; gap: 6px; }
.section-icon { width: 15px; height: 15px; flex-shrink: 0; }
.section-heading-row { display: flex; align-items: center; justify-content: space-between; }
.meta-card { background: $white; border: 1px solid $gray-200; border-radius: $radius; padding: 20px; }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.meta-field { display: flex; flex-direction: column; gap: 4px; }
.meta-field--full { grid-column: 1 / -1; }
.field-label { font-size: 10px; font-weight: 700; color: $gray-500; text-transform: uppercase; letter-spacing: 0.04em; }
.field-input { height: 38px; padding: 0 12px; border: 1.5px solid $gray-200; border-radius: $radius-sm; font-size: 12px; font-family: $font; color: $gray-900; background: $white; outline: none; transition: border-color $transition, box-shadow $transition; &::placeholder { color: $gray-400; } &:focus { border-color: $blue; box-shadow: 0 0 0 3px rgba($blue, 0.08); } &:disabled { background: $gray-50; color: $gray-500; cursor: default; border-color: $gray-200; } }
.custom-select { position: relative; }
.select-trigger { display: flex; align-items: center; width: 100%; height: 38px; padding: 0 10px; border: 1.5px solid $gray-200; border-radius: $radius-sm; background: $white; cursor: pointer; transition: border-color $transition; font-family: $font; font-size: 12px; color: $gray-400; text-align: left; gap: 6px; &.has-value { color: $gray-900; } &:hover:not(:disabled), &:focus:not(:disabled) { border-color: $blue; } &:disabled { background: $gray-50; color: $gray-500; cursor: default; } }
.select-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-chevron { flex-shrink: 0; display: flex; align-items: center; color: $gray-400; svg { width: 14px; height: 14px; } }
.select-options { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: $white; border: 1.5px solid $gray-200; border-radius: $radius-sm; box-shadow: 0 4px 16px rgba(0,0,0,0.08); z-index: 50; list-style: none; margin: 0; padding: 4px 0; max-height: 220px; overflow-y: auto; }
.select-option { padding: 8px 12px; font-size: 12px; color: $gray-700; cursor: pointer; transition: background $transition; &:hover { background: $gray-50; } }
.select-option--placeholder { color: $gray-400; font-weight: 500; }
.select-option--empty { color: $gray-400; cursor: default; font-style: italic; &:hover { background: transparent; } }
.select-search-wrap { padding: 6px 8px; cursor: default; &:hover { background: transparent; } }
.select-search-input { width: 100%; height: 30px; padding: 0 8px; border: 1px solid $gray-200; border-radius: $radius-xs; font-size: 12px; font-family: $font; color: $gray-900; background: $white; outline: none; &::placeholder { color: $gray-400; } &:focus { border-color: $blue; } }
.btn-add-location { display: flex; align-items: center; gap: 4px; padding: 5px 10px; font-size: 11px; font-weight: 600; font-family: $font; color: $blue; background: $blue-50; border: none; border-radius: $radius-sm; cursor: pointer; transition: background $transition; svg { width: 14px; height: 14px; } &:hover { background: darken($blue-50, 4%); } }
.deliveries-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.delivery-card { position: relative; background: $white; border: 1px solid $gray-200; border-radius: $radius; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: border-color $transition; &:hover { border-color: $gray-300; } }
.btn-remove-delivery { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: none; background: none; color: $gray-300; border-radius: $radius-xs; cursor: pointer; transition: color $transition, background $transition; svg { width: 15px; height: 15px; } &:hover { color: $red; background: rgba($red, 0.06); } }
.delivery-card-header { display: flex; align-items: center; gap: 8px; }
.delivery-index { width: 24px; height: 24px; border-radius: 50%; background: $blue-50; color: $blue; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.delivery-label-input { flex: 1; font-size: 13px; font-weight: 600; font-family: $font; color: $gray-900; background: transparent; border: none; border-bottom: 1px solid transparent; outline: none; padding: 2px 0; transition: border-color $transition; &:hover { border-bottom-color: $gray-300; } &:focus { border-bottom-color: $blue; } &::placeholder { color: $gray-400; font-weight: 400; } }
.delivery-label-static { flex: 1; font-size: 13px; font-weight: 600; color: $gray-900; padding: 2px 0; }
.delivery-fields { display: flex; flex-direction: column; gap: 8px; }
.delivery-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.delivery-field { display: flex; flex-direction: column; gap: 3px; }
.field-label-sm { font-size: 9px; font-weight: 700; color: $gray-400; text-transform: uppercase; letter-spacing: 0.04em; }
.field-input-sm { height: 34px; padding: 0 10px; border: 1px solid $gray-200; border-radius: $radius-xs; font-size: 12px; font-family: $font; color: $gray-900; background: $white; outline: none; transition: border-color $transition, box-shadow $transition; &::placeholder { color: $gray-400; } &:focus { border-color: $blue; box-shadow: 0 0 0 3px rgba($blue, 0.08); } &:disabled { background: $gray-50; color: $gray-500; cursor: default; } }
.field-select { height: 34px; padding: 0 8px; border: 1px solid $gray-200; border-radius: $radius-xs; font-size: 12px; font-family: $font; color: $gray-900; background: $white; outline: none; cursor: pointer; transition: border-color $transition; &:focus { border-color: $blue; } &:disabled { background: $gray-50; color: $gray-500; cursor: default; } }
.field-textarea { padding: 8px 10px; border: 1px solid $gray-200; border-radius: $radius-xs; font-size: 12px; font-family: $font; color: $gray-900; background: $white; outline: none; resize: none; transition: border-color $transition, box-shadow $transition; &::placeholder { color: $gray-400; } &:focus { border-color: $blue; box-shadow: 0 0 0 3px rgba($blue, 0.08); } &:disabled { background: $gray-50; color: $gray-500; cursor: default; } }
.booking-connect-wrap { position: relative; }
.btn-connect-booking { display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 11px; font-weight: 700; font-family: $font; color: $white; background: $gray-800; border: none; border-radius: $radius-sm; cursor: pointer; transition: background $transition; svg { width: 14px; height: 14px; } &:hover { background: $gray-700; } }
.booking-dropdown { position: absolute; right: 0; top: calc(100% + 6px); width: 320px; background: $white; border: 1.5px solid $gray-200; border-radius: $radius; box-shadow: 0 6px 24px rgba(0,0,0,0.1); z-index: 50; overflow: hidden; }
.booking-dropdown-search { padding: 10px; background: $gray-50; border-bottom: 1px solid $gray-100; }
.booking-dropdown-list { max-height: 240px; overflow-y: auto; }
.booking-dropdown-item { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 10px 12px; border: none; border-bottom: 1px solid $gray-50; background: $white; font-family: $font; font-size: 12px; cursor: pointer; text-align: left; transition: background $transition; &:hover:not(:disabled) { background: $gray-50; } &.is-attached { opacity: 0.5; cursor: not-allowed; background: $gray-50; } }
.booking-dropdown-item-info { display: flex; flex-direction: column; gap: 1px; }
.booking-bn { font-weight: 700; color: $gray-900; font-size: 12px; }
.booking-title-label { font-size: 11px; color: $gray-500; }
.booking-check-icon { width: 16px; height: 16px; color: $green; flex-shrink: 0; }
.booking-plus-icon { width: 16px; height: 16px; color: $gray-400; flex-shrink: 0; }
.booking-dropdown-empty { padding: 16px; text-align: center; font-size: 12px; color: $gray-400; }
.bookings-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 20px; border: 2px dashed $gray-200; border-radius: $radius; background: $white; }
.bookings-empty-icon { width: 32px; height: 32px; color: $gray-300; margin-bottom: 10px; }
.bookings-empty-text { font-size: 13px; font-weight: 600; color: $gray-500; margin: 0; }
.bookings-empty-hint { font-size: 11px; color: $gray-400; margin: 4px 0 0; }
.booking-block { background: $white; border: 1px solid $gray-200; border-radius: $radius; overflow: hidden; margin-top: 4px; }
.booking-block-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: $gray-800; color: $white; }
.booking-block-header-info { display: flex; align-items: center; gap: 10px; }
.booking-block-bn { font-family: $font; font-size: 11px; font-weight: 600; background: rgba($white, 0.12); padding: 3px 8px; border-radius: $radius-xs; }
.booking-block-title { font-size: 12px; font-weight: 500; opacity: 0.85; }
.btn-detach-booking { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: none; color: rgba($white, 0.4); border-radius: $radius-xs; cursor: pointer; transition: color $transition, background $transition; svg { width: 15px; height: 15px; } &:hover { color: $white; background: rgba($white, 0.1); } }
.booking-items-list { padding: 0; }
.sku-block { padding: 16px; border-bottom: 1px solid $gray-100; &:last-child { border-bottom: none; } }
.sku-info-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.sku-thumb { width: 44px; height: 44px; border-radius: $radius-sm; object-fit: cover; border: 1px solid $gray-200; flex-shrink: 0; }
.sku-thumb-placeholder { width: 44px; height: 44px; border-radius: $radius-sm; background: $gray-100; display: flex; align-items: center; justify-content: center; color: $gray-400; flex-shrink: 0; svg { width: 22px; height: 22px; } }
.sku-details { flex: 1; min-width: 0; }
.sku-model { font-size: 13px; font-weight: 700; color: $gray-900; }
.sku-variant { font-size: 11px; color: $gray-500; margin-top: 1px; }
.sku-allocation-summary { text-align: right; flex-shrink: 0; }
.sku-allocated-count { font-size: 20px; font-weight: 700; color: $gray-900; }
.sku-total-count { font-size: 12px; font-weight: 400; color: $gray-400; }
.sku-alloc-label { display: block; font-size: 9px; font-weight: 700; color: $gray-400; text-transform: uppercase; letter-spacing: 0.05em; }
.alloc-full .sku-allocated-count { color: $green; }
.alloc-over .sku-allocated-count { color: $red; }
.alloc-partial .sku-allocated-count { color: $gray-900; }
.alloc-table { background: $gray-50; border: 1px solid $gray-200; border-radius: $radius-sm; overflow: hidden; }
.alloc-table-head { display: grid; grid-template-columns: 90px 1fr 1fr 1fr 70px; gap: 8px; padding: 6px 12px; border-bottom: 1px solid $gray-200; }
.mode-preview .alloc-table-head { grid-template-columns: 90px 1fr 1fr 1fr; }
.alloc-th { font-size: 9px; font-weight: 700; color: $gray-400; text-transform: uppercase; letter-spacing: 0.04em; }
.alloc-th-action { text-align: center; }
.alloc-table-body { display: flex; flex-direction: column; }
.alloc-row { display: grid; grid-template-columns: 90px 1fr 1fr 1fr 70px; gap: 8px; padding: 8px 12px; align-items: start; border-bottom: 1px solid $gray-100; transition: background $transition; &:last-child { border-bottom: none; } &:hover { background: $white; } &.alloc-row--split { border-left: 3px solid $blue; } &.alloc-row--readonly { grid-template-columns: 90px 1fr 1fr 1fr; } }
.alloc-cell { display: flex; flex-direction: column; gap: 4px; }
.alloc-cell-action { flex-direction: row; justify-content: center; align-items: center; gap: 4px; }
.alloc-qty-input { width: 72px; height: 32px; border: 1px solid $gray-200; border-radius: $radius-xs; text-align: center; font-family: $font; font-size: 12px; font-weight: 600; color: $gray-900; background: $white; outline: none; transition: border-color $transition, box-shadow $transition; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } &:focus { border-color: $blue; box-shadow: 0 0 0 3px rgba($blue, 0.08); } &:disabled { background: $gray-50; color: $gray-500; cursor: default; border-color: $gray-200; } }
.alloc-split-label { font-size: 9px; color: $gray-400; }
.alloc-select { width: 100%; height: 32px; padding: 0 6px; border: 1px solid $gray-200; border-radius: $radius-xs; font-size: 11px; font-family: $font; color: $gray-900; background: $white; outline: none; cursor: pointer; transition: border-color $transition; &:focus { border-color: $blue; } &:disabled { background: $gray-50; color: $gray-500; cursor: default; border-color: $gray-200; } }
.alloc-dest-type { font-size: 9px; color: $gray-400; }
.alloc-mockup-input { width: 100%; height: 26px; padding: 0 6px; border: none; border-bottom: 1px solid $gray-200; font-size: 11px; font-family: $font; color: $gray-700; background: transparent; outline: none; transition: border-color $transition; &::placeholder { color: $gray-400; } &:focus { border-bottom-color: $blue; } &:disabled { color: $gray-500; cursor: default; } }
.btn-split { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: $blue-50; color: $blue; border-radius: $radius-xs; cursor: pointer; transition: background $transition, opacity $transition; svg { width: 14px; height: 14px; } &:hover:not(:disabled) { background: darken($blue-50, 6%); } &.btn-split--disabled { opacity: 0.35; cursor: not-allowed; } }
.btn-remove-alloc { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: none; color: $gray-400; border-radius: $radius-xs; cursor: pointer; transition: color $transition, background $transition; svg { width: 14px; height: 14px; } &:hover { color: $red; background: rgba($red, 0.06); } }

@media (max-width: 768px) {
    .meta-grid { grid-template-columns: 1fr; }
    .meta-field--full { grid-column: 1; }
    .deliveries-grid { grid-template-columns: 1fr; }
    .alloc-table-head, .alloc-row { grid-template-columns: 1fr; gap: 6px; }
    .alloc-table-head { display: none; }
    .alloc-row { padding: 12px; &.alloc-row--readonly { grid-template-columns: 1fr; } }
    .alloc-cell-action { justify-content: flex-start; }
    .top-bar { flex-wrap: wrap; height: auto; padding: 10px 14px; gap: 8px; }
    .top-bar-actions { width: 100%; justify-content: flex-end; }
    .form-content { padding: 16px 12px 48px; }
    .booking-dropdown { width: 280px; }
}
@media (max-width: 480px) {
    .delivery-row-2col { grid-template-columns: 1fr; }
    .top-bar-actions { flex-direction: column; }
    .btn-draft, .btn-submit, .btn-edit, .btn-delete, .btn-nevermind { width: 100%; text-align: center; justify-content: center; }
}
</style>
