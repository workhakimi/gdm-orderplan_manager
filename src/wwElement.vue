<template>
    <div class="orderplan-manager">
        <!-- ═══════════ STICKY TOP BAR ═══════════ -->
        <div class="top-bar">
            <div class="top-bar-left">
                <button type="button" class="btn-close" @click="handleClose">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div class="top-bar-info">
                    <h2 class="top-bar-title">{{ isEditMode ? 'Edit Order Plan' : 'Create Order Plan' }}</h2>
                    <p class="top-bar-subtitle">{{ isEditMode ? `Editing ${formTitle || 'Untitled'}` : 'Draft mode' }}</p>
                </div>
            </div>
            <div class="top-bar-actions">
                <button type="button" class="btn-draft" @click="handleSaveDraft">Save Draft</button>
                <button type="button" class="btn-submit" @click="handleSubmit">Submit for Processing</button>
            </div>
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
                            <input type="text" class="field-input" v-model="formTitle" placeholder="e.g., Summer Campaign 2024" />
                        </div>
                        <div class="meta-field">
                            <label class="field-label">Quote Reference</label>
                            <input type="text" class="field-input" v-model="formQuoteRef" placeholder="Q-202X-XXX" />
                        </div>
                        <div class="meta-field">
                            <label class="field-label">Invoice Reference</label>
                            <input type="text" class="field-input" v-model="formInvoiceRef" placeholder="INV-202X-XXX" />
                        </div>
                        <div class="meta-field">
                            <label class="field-label">PIC (BDA)</label>
                            <div class="custom-select" ref="picBdaSelectEl">
                                <button type="button" class="select-trigger" :class="{ 'has-value': !!formPicBda }" @click="toggleDropdown('picBda')">
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
                                <button type="button" class="select-trigger" :class="{ 'has-value': !!formPicOps }" @click="toggleDropdown('picOps')">
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
                    <button type="button" class="btn-add-location" @click="addDelivery">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Location
                    </button>
                </div>
                <div class="deliveries-grid">
                    <div v-for="(del, dIdx) in formDeliveries" :key="del._uid" class="delivery-card">
                        <button v-if="formDeliveries.length > 1" type="button" class="btn-remove-delivery" @click="removeDelivery(dIdx)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                        <div class="delivery-card-header">
                            <div class="delivery-index">{{ dIdx + 1 }}</div>
                            <input type="text" class="delivery-label-input" v-model="del.label" placeholder="Location Name" />
                        </div>
                        <div class="delivery-fields">
                            <div class="delivery-row-2col">
                                <div class="delivery-field">
                                    <label class="field-label-sm">Type</label>
                                    <select class="field-select" v-model="del.deliverytype">
                                        <option v-for="dt in DELIVERY_TYPES" :key="dt" :value="dt">{{ dt }}</option>
                                    </select>
                                </div>
                                <div class="delivery-field">
                                    <label class="field-label-sm">Deadline</label>
                                    <input type="datetime-local" class="field-input-sm" v-model="del.deadline" />
                                </div>
                            </div>
                            <div class="delivery-field">
                                <label class="field-label-sm">Address</label>
                                <textarea class="field-textarea" v-model="del.address" rows="2" placeholder="Full delivery address..."></textarea>
                            </div>
                            <div class="delivery-field">
                                <label class="field-label-sm">Remarks</label>
                                <input type="text" class="field-input-sm" v-model="del.remarks" placeholder="Optional notes..." />
                            </div>
                            <div class="delivery-row-2col">
                                <div class="delivery-field">
                                    <label class="field-label-sm">Contact Name</label>
                                    <input type="text" class="field-input-sm" v-model="del.pic_name" placeholder="Contact person" />
                                </div>
                                <div class="delivery-field">
                                    <label class="field-label-sm">Contact Phone</label>
                                    <input type="text" class="field-input-sm" v-model="del.pic_phone" placeholder="Phone number" />
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
                    <div class="booking-connect-wrap" ref="bookingConnectEl">
                        <button type="button" class="btn-connect-booking" @click="toggleDropdown('bookingConnect')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Connect Booking
                        </button>
                        <div v-if="openDropdown === 'bookingConnect'" class="booking-dropdown">
                            <div class="booking-dropdown-search">
                                <input ref="bookingSearchInput" v-model="bookingSearch" type="text" class="select-search-input" placeholder="Search by BN number or title..." @keydown.stop autofocus />
                            </div>
                            <div class="booking-dropdown-list">
                                <button v-for="bh in filteredBookingHeaders" :key="bh.id" type="button" class="booking-dropdown-item" :class="{ 'is-attached': isBookingAttached(bh.id) }" :disabled="isBookingAttached(bh.id)" @click="attachBooking(bh)">
                                    <div class="booking-dropdown-item-info">
                                        <span class="booking-bn">{{ bh.bookingnumber }}</span>
                                        <span class="booking-title-label">{{ bh.bookingtitle }}</span>
                                    </div>
                                    <svg v-if="isBookingAttached(bh.id)" class="booking-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
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
                    <p class="bookings-empty-hint">Connect a booking to start planning allocations.</p>
                </div>

                <!-- Booking blocks -->
                <div v-for="(ab, abIdx) in formAttachedBookings" :key="ab.booking_headerid" class="booking-block">
                    <div class="booking-block-header">
                        <div class="booking-block-header-info">
                            <span class="booking-block-bn">{{ getBookingNumber(ab.booking_headerid) }}</span>
                            <span class="booking-block-title">{{ getBookingTitle(ab.booking_headerid) }}</span>
                        </div>
                        <button type="button" class="btn-detach-booking" @click="detachBooking(abIdx)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>

                    <!-- SKU items from this booking -->
                    <div class="booking-items-list">
                        <div v-for="item in getBookingItemsForHeader(ab.booking_headerid)" :key="item.id" class="sku-block">
                            <!-- SKU info row -->
                            <div class="sku-info-row">
                                <img v-if="getInventoryImage(item.sku)" :src="getInventoryImage(item.sku)" :alt="getInventoryModel(item.sku)" class="sku-thumb" />
                                <div v-else class="sku-thumb-placeholder">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                                </div>
                                <div class="sku-details">
                                    <div class="sku-model">{{ getInventoryModel(item.sku) }}</div>
                                    <div class="sku-variant">{{ getInventoryColor(item.sku) }} · {{ item.sku }}</div>
                                </div>
                                <div class="sku-allocation-summary" :class="allocationStatusClass(ab.booking_headerid, item.id, item.quantity)">
                                    <span class="sku-allocated-count">{{ getAllocatedTotal(ab.booking_headerid, item.id) }}</span>
                                    <span class="sku-total-count">/ {{ item.quantity }}</span>
                                    <span class="sku-alloc-label">Allocated</span>
                                </div>
                            </div>

                            <!-- Allocation table -->
                            <div class="alloc-table">
                                <div class="alloc-table-head">
                                    <span class="alloc-th alloc-th-qty">Quantity</span>
                                    <span class="alloc-th alloc-th-dest">Destination</span>
                                    <span class="alloc-th alloc-th-cust">Customization</span>
                                    <span class="alloc-th alloc-th-labor">Labor & Mockup</span>
                                    <span class="alloc-th alloc-th-action">Action</span>
                                </div>
                                <div class="alloc-table-body">
                                    <div v-for="(alloc, aIdx) in getAllocations(ab.booking_headerid, item.id)" :key="alloc._uid" class="alloc-row" :class="{ 'alloc-row--split': getAllocations(ab.booking_headerid, item.id).length > 1 }">
                                        <!-- Qty -->
                                        <div class="alloc-cell alloc-cell-qty">
                                            <input type="number" class="alloc-qty-input" :value="alloc.quantity_assigned" min="1" @input="updateAllocationQty(ab.booking_headerid, item.id, aIdx, $event.target.value)" />
                                            <span v-if="getAllocations(ab.booking_headerid, item.id).length > 1" class="alloc-split-label">Split #{{ aIdx + 1 }}</span>
                                        </div>
                                        <!-- Destination -->
                                        <div class="alloc-cell alloc-cell-dest">
                                            <select class="alloc-select" :value="alloc.deliveries_headerid" @change="updateAllocationField(ab.booking_headerid, item.id, aIdx, 'deliveries_headerid', $event.target.value)">
                                                <option v-for="d in formDeliveries" :key="d._uid" :value="d._uid">{{ d.label || 'Unnamed Location' }}</option>
                                            </select>
                                            <span class="alloc-dest-type">{{ getDeliveryType(alloc.deliveries_headerid) }}</span>
                                        </div>
                                        <!-- Customization -->
                                        <div class="alloc-cell alloc-cell-cust">
                                            <select class="alloc-select" :value="alloc.customization" @change="updateAllocationField(ab.booking_headerid, item.id, aIdx, 'customization', $event.target.value)">
                                                <option v-for="c in CUSTOMIZATION_OPTIONS" :key="c" :value="c">{{ c }}</option>
                                            </select>
                                            <input v-if="alloc.customization !== 'None'" type="text" class="alloc-mockup-input" placeholder="Paste mockup link..." :value="alloc.mockupLink" @input="updateAllocationField(ab.booking_headerid, item.id, aIdx, 'mockupLink', $event.target.value)" />
                                        </div>
                                        <!-- Labor -->
                                        <div class="alloc-cell alloc-cell-labor">
                                            <label v-for="lo in LABOR_OPTIONS" :key="lo.id" class="alloc-labor-check">
                                                <input type="checkbox" :checked="alloc.labor && alloc.labor[lo.id]" @change="toggleLabor(ab.booking_headerid, item.id, aIdx, lo.id, $event.target.checked)" />
                                                <span>{{ lo.label }}</span>
                                            </label>
                                        </div>
                                        <!-- Actions -->
                                        <div class="alloc-cell alloc-cell-action">
                                            <button type="button" class="btn-split" title="Split Quantity" @click="handleSplit(ab.booking_headerid, item.id, aIdx)">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
                                            </button>
                                            <button v-if="getAllocations(ab.booking_headerid, item.id).length > 1" type="button" class="btn-remove-alloc" title="Remove Split" @click="removeAllocation(ab.booking_headerid, item.id, aIdx)">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </div>
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
const CUSTOMIZATION_OPTIONS = ['None', 'UV 1 Logo', 'UV 2 Logos', 'UV 360', 'Laser Engraving', 'Deboss'];
const LABOR_OPTIONS = [
    { id: 'sleeving', label: 'Box Sleeving' },
    { id: 'giftbox', label: 'Standard Gift Box' },
    { id: 'giftbox_addons', label: 'Gift Box + Addons' },
];

function generateUid() {
    try { return wwLib.wwUtils.getUid(); } catch { return 'uid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9); }
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function makeDefaultDelivery(label) {
    return {
        _uid: generateUid(),
        _existingId: null,
        label: label || 'Main Office',
        deliverytype: 'Klang Valley',
        address: '',
        remarks: '',
        pic_name: '',
        pic_phone: '',
        deadline: '',
    };
}

function makeDefaultAllocation(deliveryUid, quantity, splitgroupid) {
    return {
        _uid: generateUid(),
        _existingId: null,
        quantity_assigned: quantity,
        deliveries_headerid: deliveryUid,
        customization: 'None',
        mockupLink: '',
        labor: {},
        splitgroupid: splitgroupid || generateUid(),
    };
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
        // ── Resolve bound collections ──
        const resolvedBookingHeaders = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.bookingHeaders) || []);
        const resolvedBookingItems = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.bookingItems) || []);
        const resolvedInventoryData = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.inventoryData) || []);
        const resolvedTeammates = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.teammatesList) || []);
        const resolvedOpHeaders = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanHeadersData) || []);
        const resolvedOpDeliveries = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanDeliveriesData) || []);
        const resolvedOpAttBookings = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanAttBookingsData) || []);
        const resolvedOpLines = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.orderplanLinesData) || []);

        const editingHeaderId = computed(() => props.content?.editingHeaderId || '');
        const isEditMode = computed(() => !!editingHeaderId.value);

        // ── Inventory lookup ──
        const inventoryLookup = computed(() => {
            const map = {};
            resolvedInventoryData.value.forEach(r => { map[r.sku] = r; });
            return map;
        });

        // ── Booking headers lookup ──
        const bookingHeadersLookup = computed(() => {
            const map = {};
            resolvedBookingHeaders.value.forEach(h => { map[h.id] = h; });
            return map;
        });

        // ── Form state ──
        const formTitle = ref('');
        const formQuoteRef = ref('');
        const formInvoiceRef = ref('');
        const formPicBda = ref(null);
        const formPicBdaName = ref('');
        const formPicOps = ref(null);
        const formPicOpsName = ref('');
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

        // ── Filtered lists ──
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
            const list = resolvedBookingHeaders.value;
            if (!q) return list;
            return list.filter(h => {
                const bn = (h.bookingnumber || '').toLowerCase();
                const title = (h.bookingtitle || '').toLowerCase();
                return bn.includes(q) || title.includes(q);
            });
        });

        // ── Display helpers ──
        const picBdaDisplay = computed(() => formPicBdaName.value || 'Select Teammate...');
        const picOpsDisplay = computed(() => formPicOpsName.value || 'Select Teammate...');

        function getBookingNumber(headerId) {
            return bookingHeadersLookup.value[headerId]?.bookingnumber || '';
        }
        function getBookingTitle(headerId) {
            return bookingHeadersLookup.value[headerId]?.bookingtitle || '';
        }
        function getInventoryImage(sku) {
            return inventoryLookup.value[sku]?.imagelink || '';
        }
        function getInventoryModel(sku) {
            return inventoryLookup.value[sku]?.model || 'Unknown Item';
        }
        function getInventoryColor(sku) {
            return inventoryLookup.value[sku]?.color || '-';
        }
        function getBookingItemsForHeader(bookingHeaderId) {
            return resolvedBookingItems.value.filter(i => i.headerid === bookingHeaderId);
        }
        function isBookingAttached(bookingHeaderId) {
            return formAttachedBookings.value.some(ab => ab.booking_headerid === bookingHeaderId);
        }
        function getDeliveryType(deliveryUid) {
            const d = formDeliveries.value.find(dd => dd._uid === deliveryUid);
            return d ? d.deliverytype : '';
        }

        // ── Allocation helpers ──
        function allocKey(bookingHeaderId, bookingItemId) {
            return `${bookingHeaderId}::${bookingItemId}`;
        }
        function getAllocations(bookingHeaderId, bookingItemId) {
            return formAllocations[allocKey(bookingHeaderId, bookingItemId)] || [];
        }
        function getAllocatedTotal(bookingHeaderId, bookingItemId) {
            const allocs = getAllocations(bookingHeaderId, bookingItemId);
            return allocs.reduce((sum, a) => sum + (parseInt(a.quantity_assigned) || 0), 0);
        }
        function allocationStatusClass(bookingHeaderId, bookingItemId, totalQty) {
            const allocated = getAllocatedTotal(bookingHeaderId, bookingItemId);
            if (allocated > totalQty) return 'alloc-over';
            if (allocated === totalQty) return 'alloc-full';
            return 'alloc-partial';
        }

        // ── Dropdown toggling ──
        function toggleDropdown(name) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (openDropdown.value === name) {
                openDropdown.value = null;
                return;
            }
            openDropdown.value = name;
            if (name === 'picBda') { picBdaSearch.value = ''; nextTick(() => picBdaSearchInput.value?.focus()); }
            if (name === 'picOps') { picOpsSearch.value = ''; nextTick(() => picOpsSearchInput.value?.focus()); }
            if (name === 'bookingConnect') { bookingSearch.value = ''; nextTick(() => bookingSearchInput.value?.focus()); }
        }

        function selectPicBda(teammate) {
            if (teammate) { formPicBda.value = teammate.id; formPicBdaName.value = teammate.name; }
            else { formPicBda.value = null; formPicBdaName.value = ''; }
            openDropdown.value = null;
        }
        function selectPicOps(teammate) {
            if (teammate) { formPicOps.value = teammate.id; formPicOpsName.value = teammate.name; }
            else { formPicOps.value = null; formPicOpsName.value = ''; }
            openDropdown.value = null;
        }

        // ── Click-outside ──
        function handleClickOutside(e) {
            if (openDropdown.value === 'picBda' && picBdaSelectEl.value && !picBdaSelectEl.value.contains(e.target)) openDropdown.value = null;
            if (openDropdown.value === 'picOps' && picOpsSelectEl.value && !picOpsSelectEl.value.contains(e.target)) openDropdown.value = null;
            if (openDropdown.value === 'bookingConnect' && bookingConnectEl.value && !bookingConnectEl.value.contains(e.target)) openDropdown.value = null;
        }
        onMounted(() => document.addEventListener('mousedown', handleClickOutside));
        onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside));

        // ── Delivery CRUD ──
        function addDelivery() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            formDeliveries.value.push(makeDefaultDelivery('New Location'));
        }
        function removeDelivery(index) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (formDeliveries.value.length <= 1) return;
            const removedUid = formDeliveries.value[index]._uid;
            formDeliveries.value.splice(index, 1);
            const fallbackUid = formDeliveries.value[0]._uid;
            for (const key in formAllocations) {
                const allocs = formAllocations[key];
                if (Array.isArray(allocs)) {
                    allocs.forEach(a => {
                        if (a.deliveries_headerid === removedUid) a.deliveries_headerid = fallbackUid;
                    });
                }
            }
        }

        // ── Booking attach/detach ──
        function attachBooking(bookingHeader) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            if (isBookingAttached(bookingHeader.id)) return;

            formAttachedBookings.value.push({ booking_headerid: bookingHeader.id });

            const items = getBookingItemsForHeader(bookingHeader.id);
            const firstDeliveryUid = formDeliveries.value[0]?._uid || '';
            items.forEach(item => {
                const key = allocKey(bookingHeader.id, item.id);
                formAllocations[key] = [makeDefaultAllocation(firstDeliveryUid, item.quantity || 0)];
            });

            openDropdown.value = null;
        }
        function detachBooking(index) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const removed = formAttachedBookings.value[index];
            if (!removed) return;
            const bhId = removed.booking_headerid;
            const items = getBookingItemsForHeader(bhId);
            items.forEach(item => {
                const key = allocKey(bhId, item.id);
                delete formAllocations[key];
            });
            formAttachedBookings.value.splice(index, 1);
        }

        // ── Allocation mutations ──
        function updateAllocationQty(bookingHeaderId, bookingItemId, allocIndex, rawValue) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const key = allocKey(bookingHeaderId, bookingItemId);
            const allocs = formAllocations[key];
            if (!allocs || !allocs[allocIndex]) return;
            allocs[allocIndex].quantity_assigned = Math.max(0, parseInt(rawValue) || 0);
        }
        function updateAllocationField(bookingHeaderId, bookingItemId, allocIndex, field, value) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const key = allocKey(bookingHeaderId, bookingItemId);
            const allocs = formAllocations[key];
            if (!allocs || !allocs[allocIndex]) return;
            allocs[allocIndex][field] = value;
        }
        function toggleLabor(bookingHeaderId, bookingItemId, allocIndex, laborId, checked) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const key = allocKey(bookingHeaderId, bookingItemId);
            const allocs = formAllocations[key];
            if (!allocs || !allocs[allocIndex]) return;
            if (!allocs[allocIndex].labor) allocs[allocIndex].labor = {};
            allocs[allocIndex].labor[laborId] = checked;
        }
        function handleSplit(bookingHeaderId, bookingItemId, allocIndex) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const key = allocKey(bookingHeaderId, bookingItemId);
            const allocs = formAllocations[key];
            if (!allocs || !allocs[allocIndex]) return;
            const original = allocs[allocIndex];
            const origQty = original.quantity_assigned;
            const half1 = Math.floor(origQty / 2);
            const half2 = origQty - half1;
            original.quantity_assigned = half1;
            const newAlloc = makeDefaultAllocation(original.deliveries_headerid, half2, original.splitgroupid);
            newAlloc.customization = original.customization;
            newAlloc.mockupLink = original.mockupLink;
            newAlloc.labor = deepClone(original.labor || {});
            allocs.splice(allocIndex + 1, 0, newAlloc);
        }
        function removeAllocation(bookingHeaderId, bookingItemId, allocIndex) {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const key = allocKey(bookingHeaderId, bookingItemId);
            const allocs = formAllocations[key];
            if (!allocs || allocs.length <= 1) return;
            const deletedQty = allocs[allocIndex].quantity_assigned;
            allocs.splice(allocIndex, 1);
            const mergeTarget = allocIndex > 0 ? allocIndex - 1 : 0;
            allocs[mergeTarget].quantity_assigned += deletedQty;
        }

        // ── Build payload ──
        function buildPayload(action) {
            const headerId = editingHeaderId.value || null;
            const status = action === 'request_process' ? 'Submitted' : 'Draft';
            const now = new Date().toISOString();

            const orderplan_headers = {
                id: headerId,
                title: formTitle.value,
                pic_bda: formPicBda.value,
                pic_ops: formPicOps.value,
                quoteref: formQuoteRef.value,
                invoiceref: formInvoiceRef.value,
                status,
                updated_at: now,
            };
            if (!headerId) {
                orderplan_headers.created_at = now;
            }
            if (action === 'request_process') {
                orderplan_headers.submitted_at = now;
            }

            const orderplan_attbookings = formAttachedBookings.value.map(ab => ({
                booking_headerid: ab.booking_headerid,
            }));

            const deliveryUidToDbId = {};
            const orderplan_deliveries = formDeliveries.value.map(d => {
                const dbId = d._existingId || null;
                deliveryUidToDbId[d._uid] = dbId;
                return {
                    id: dbId,
                    label: d.label,
                    deliverytype: d.deliverytype,
                    address: d.address,
                    remarks: d.remarks,
                    pic_name: d.pic_name,
                    pic_phone: d.pic_phone,
                    deadline: d.deadline || null,
                    _uid: d._uid,
                };
            });

            const orderplan_lines = [];
            for (const key in formAllocations) {
                const allocs = formAllocations[key];
                if (!Array.isArray(allocs)) continue;
                const parts = key.split('::');
                const bookingItemId = parts[1];
                allocs.forEach(a => {
                    orderplan_lines.push({
                        id: a._existingId || null,
                        bookingitems_headerid: bookingItemId,
                        deliveries_headerid: a.deliveries_headerid,
                        deliveries_db_id: deliveryUidToDbId[a.deliveries_headerid] || null,
                        customization: a.customization === 'None' ? null : a.customization,
                        quantity_assigned: a.quantity_assigned,
                        splitgroupid: a.splitgroupid,
                        mockup_link: a.mockupLink || null,
                        labor: a.labor && Object.keys(a.labor).filter(k => a.labor[k]).length > 0
                            ? a.labor
                            : null,
                    });
                });
            }

            const changes = computeChanges(orderplan_headers, orderplan_attbookings, orderplan_deliveries, orderplan_lines);

            return {
                action,
                orderplan_headers,
                orderplan_attbookings,
                orderplan_deliveries,
                orderplan_lines,
                changes,
            };
        }

        // ── Change tracking ──
        function computeChanges(headers, attBookings, deliveries, lines) {
            if (!originalData.value) return {};
            const orig = originalData.value;
            const changes = {};

            const headerFields = ['title', 'pic_bda', 'pic_ops', 'quoteref', 'invoiceref'];
            const headerChanges = {};
            headerFields.forEach(f => {
                if (headers[f] !== (orig.headers[f] ?? null)) {
                    headerChanges[f] = { from: orig.headers[f] ?? null, to: headers[f] };
                }
            });
            if (Object.keys(headerChanges).length) changes.orderplan_headers = headerChanges;

            const origBookingIds = new Set(orig.attBookings.map(b => b.booking_headerid));
            const newBookingIds = new Set(attBookings.map(b => b.booking_headerid));
            const addedBookings = attBookings.filter(b => !origBookingIds.has(b.booking_headerid));
            const removedBookings = orig.attBookings.filter(b => !newBookingIds.has(b.booking_headerid));
            if (addedBookings.length || removedBookings.length) {
                changes.orderplan_attbookings = { added: addedBookings, removed: removedBookings };
            }

            const origDeliveryIds = new Set(orig.deliveries.map(d => d.id).filter(Boolean));
            const currentDeliveryIds = new Set(deliveries.map(d => d.id).filter(Boolean));
            const addedDeliveries = deliveries.filter(d => !d.id);
            const removedDeliveries = orig.deliveries.filter(d => d.id && !currentDeliveryIds.has(d.id));
            const modifiedDeliveries = deliveries.filter(d => d.id && origDeliveryIds.has(d.id));
            if (addedDeliveries.length || removedDeliveries.length || modifiedDeliveries.length) {
                changes.orderplan_deliveries = { added: addedDeliveries, removed: removedDeliveries, modified: modifiedDeliveries };
            }

            const origLineIds = new Set(orig.lines.map(l => l.id).filter(Boolean));
            const currentLineIds = new Set(lines.map(l => l.id).filter(Boolean));
            const addedLines = lines.filter(l => !l.id);
            const removedLines = orig.lines.filter(l => l.id && !currentLineIds.has(l.id));
            if (addedLines.length || removedLines.length) {
                changes.orderplan_lines = { added: addedLines, removed: removedLines };
            }

            return changes;
        }

        // ── Emit handlers ──
        function handleSaveDraft() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const payload = buildPayload('save_draft');
            emit('trigger-event', { name: 'onSaveDraft', event: { value: payload } });
        }
        function handleSubmit() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            const payload = buildPayload('request_process');
            emit('trigger-event', { name: 'onSubmitProcessing', event: { value: payload } });
        }
        function handleClose() {
            /* wwEditor:start */
            if (props.wwEditorState?.isEditing) return;
            /* wwEditor:end */
            emit('trigger-event', { name: 'onClose', event: { value: null } });
        }

        // ── Populate form from existing data (edit mode) ──
        function populateFromExisting(headerId) {
            const header = resolvedOpHeaders.value.find(h => h.id === headerId);
            if (!header) return;

            formTitle.value = header.title || '';
            formQuoteRef.value = header.quoteref || '';
            formInvoiceRef.value = header.invoiceref || '';
            formPicBda.value = header.pic_bda || null;
            formPicOps.value = header.pic_ops || null;

            if (header.pic_bda) {
                const tm = resolvedTeammates.value.find(t => t.id === header.pic_bda);
                formPicBdaName.value = tm ? tm.name : '';
            }
            if (header.pic_ops) {
                const tm = resolvedTeammates.value.find(t => t.id === header.pic_ops);
                formPicOpsName.value = tm ? tm.name : '';
            }

            const deliveries = resolvedOpDeliveries.value.filter(d => d.headerid === headerId);
            if (deliveries.length > 0) {
                formDeliveries.value = deliveries.map(d => ({
                    _uid: d.id || generateUid(),
                    _existingId: d.id || null,
                    label: d.label || '',
                    deliverytype: d.deliverytype || 'Klang Valley',
                    address: d.address || '',
                    remarks: d.remarks || '',
                    pic_name: d.pic_name || '',
                    pic_phone: d.pic_phone || '',
                    deadline: d.deadline ? d.deadline.split('T')[0] : '',
                }));
            } else {
                formDeliveries.value = [makeDefaultDelivery('Main Office')];
            }

            const deliveryIdToUid = {};
            formDeliveries.value.forEach(d => {
                if (d._existingId) deliveryIdToUid[d._existingId] = d._uid;
            });

            const attBookings = resolvedOpAttBookings.value.filter(ab => ab.headerid === headerId);
            formAttachedBookings.value = attBookings.map(ab => ({ booking_headerid: ab.booking_headerid }));

            for (const key in formAllocations) delete formAllocations[key];

            const lines = resolvedOpLines.value.filter(l => l.headerid === headerId);
            const linesByItem = {};
            lines.forEach(l => {
                const bhId = findBookingHeaderForItem(l.bookingitems_headerid);
                if (!bhId) return;
                const key = allocKey(bhId, l.bookingitems_headerid);
                if (!linesByItem[key]) linesByItem[key] = [];
                linesByItem[key].push({
                    _uid: generateUid(),
                    _existingId: l.id || null,
                    quantity_assigned: l.quantity_assigned || 0,
                    deliveries_headerid: deliveryIdToUid[l.deliveries_headerid] || formDeliveries.value[0]?._uid || '',
                    customization: l.customization || 'None',
                    mockupLink: '',
                    labor: {},
                    splitgroupid: l.splitgroupid || generateUid(),
                });
            });
            for (const key in linesByItem) {
                formAllocations[key] = linesByItem[key];
            }

            const firstDeliveryUid = formDeliveries.value[0]?._uid || '';
            formAttachedBookings.value.forEach(ab => {
                const items = getBookingItemsForHeader(ab.booking_headerid);
                items.forEach(item => {
                    const key = allocKey(ab.booking_headerid, item.id);
                    if (!formAllocations[key]) {
                        formAllocations[key] = [makeDefaultAllocation(firstDeliveryUid, item.quantity || 0)];
                    }
                });
            });

            originalData.value = {
                headers: {
                    title: header.title || '',
                    pic_bda: header.pic_bda || null,
                    pic_ops: header.pic_ops || null,
                    quoteref: header.quoteref || '',
                    invoiceref: header.invoiceref || '',
                },
                attBookings: attBookings.map(ab => ({ booking_headerid: ab.booking_headerid })),
                deliveries: deliveries.map(d => ({
                    id: d.id,
                    label: d.label,
                    deliverytype: d.deliverytype,
                    address: d.address,
                    remarks: d.remarks,
                    pic_name: d.pic_name,
                    pic_phone: d.pic_phone,
                    deadline: d.deadline,
                })),
                lines: lines.map(l => ({
                    id: l.id,
                    bookingitems_headerid: l.bookingitems_headerid,
                    deliveries_headerid: l.deliveries_headerid,
                    customization: l.customization,
                    quantity_assigned: l.quantity_assigned,
                    splitgroupid: l.splitgroupid,
                })),
            };
        }

        function findBookingHeaderForItem(bookingItemId) {
            const item = resolvedBookingItems.value.find(i => i.id === bookingItemId);
            return item ? item.headerid : null;
        }

        function resetForm() {
            formTitle.value = '';
            formQuoteRef.value = '';
            formInvoiceRef.value = '';
            formPicBda.value = null;
            formPicBdaName.value = '';
            formPicOps.value = null;
            formPicOpsName.value = '';
            formDeliveries.value = [makeDefaultDelivery('Main Office')];
            formAttachedBookings.value = [];
            for (const key in formAllocations) delete formAllocations[key];
            originalData.value = null;
        }

        // ── Watch editingHeaderId for mode changes ──
        watch(editingHeaderId, (newId) => {
            if (newId === lastLoadedHeaderId.value) return;
            lastLoadedHeaderId.value = newId;
            if (newId) {
                populateFromExisting(newId);
            } else {
                resetForm();
            }
        }, { immediate: true });

        // Re-populate if the source data arrives after the editingHeaderId was already set
        watch([resolvedOpHeaders, resolvedOpDeliveries, resolvedOpAttBookings, resolvedOpLines], () => {
            const hId = editingHeaderId.value;
            if (hId && !originalData.value) {
                const header = resolvedOpHeaders.value.find(h => h.id === hId);
                if (header) populateFromExisting(hId);
            }
        });

        return {
            DELIVERY_TYPES,
            CUSTOMIZATION_OPTIONS,
            LABOR_OPTIONS,
            isEditMode,
            formTitle,
            formQuoteRef,
            formInvoiceRef,
            formPicBda,
            formPicBdaName,
            formPicOps,
            formPicOpsName,
            formDeliveries,
            formAttachedBookings,
            formAllocations,
            openDropdown,
            picBdaSearch,
            picOpsSearch,
            bookingSearch,
            picBdaSelectEl,
            picOpsSelectEl,
            bookingConnectEl,
            picBdaSearchInput,
            picOpsSearchInput,
            bookingSearchInput,
            filteredTeammatesBda,
            filteredTeammatesOps,
            filteredBookingHeaders,
            picBdaDisplay,
            picOpsDisplay,
            getBookingNumber,
            getBookingTitle,
            getInventoryImage,
            getInventoryModel,
            getInventoryColor,
            getBookingItemsForHeader,
            isBookingAttached,
            getDeliveryType,
            getAllocations,
            getAllocatedTotal,
            allocationStatusClass,
            toggleDropdown,
            selectPicBda,
            selectPicOps,
            addDelivery,
            removeDelivery,
            attachBooking,
            detachBooking,
            updateAllocationQty,
            updateAllocationField,
            toggleLabor,
            handleSplit,
            removeAllocation,
            handleSaveDraft,
            handleSubmit,
            handleClose,
        };
    },
};
</script>

<style lang="scss" scoped>
/* ── Tokens ── */
$blue: #3b82f6;
$blue-dark: #2563eb;
$blue-50: #eff6ff;
$red: #ef4444;
$red-dark: #dc2626;
$green: #059669;
$green-light: #d1fae5;
$orange: #f59e0b;
$orange-light: #fef3c7;
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
$radius: 10px;
$radius-sm: 6px;
$radius-xs: 4px;
$transition: 0.15s ease;
$font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* ── Root ── */
.orderplan-manager {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    background: $gray-50;
    font-family: $font;
    font-size: 12px;
    color: $gray-900;
}

/* ═══════════ TOP BAR ═══════════ */
.top-bar {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    background: $white;
    border-bottom: 1px solid $gray-200;
    flex-shrink: 0;
}
.top-bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
}
.btn-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: $gray-500;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: color $transition, background $transition;
    svg { width: 18px; height: 18px; }
    &:hover { color: $gray-900; background: $gray-100; }
}
.top-bar-info {
    display: flex;
    flex-direction: column;
}
.top-bar-title {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
    color: $gray-900;
}
.top-bar-subtitle {
    font-size: 11px;
    color: $gray-500;
    margin: 0;
}
.top-bar-actions {
    display: flex;
    gap: 8px;
}
.btn-draft {
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    font-family: $font;
    color: $gray-600;
    background: $white;
    border: 1px solid $gray-300;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all $transition;
    &:hover { background: $gray-50; border-color: $gray-400; }
}
.btn-submit {
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    font-family: $font;
    color: $white;
    background: $blue;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background $transition;
    &:hover { background: $blue-dark; }
}

/* ═══════════ FORM CONTENT ═══════════ */
.form-content {
    flex: 1;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 28px;
}
.form-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.section-heading {
    font-size: 11px;
    font-weight: 700;
    color: $gray-400;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
}
.section-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
}
.section-heading-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* ── METADATA SECTION ── */
.meta-card {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius;
    padding: 20px;
}
.meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}
.meta-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.meta-field--full {
    grid-column: 1 / -1;
}
.field-label {
    font-size: 10px;
    font-weight: 700;
    color: $gray-500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.field-input {
    height: 38px;
    padding: 0 12px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    font-size: 12px;
    font-family: $font;
    color: $gray-900;
    background: $gray-50;
    outline: none;
    transition: border-color $transition;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; background: $white; }
}

/* ── Custom Select (shared) ── */
.custom-select {
    position: relative;
}
.select-trigger {
    display: flex;
    align-items: center;
    width: 100%;
    height: 38px;
    padding: 0 10px;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    background: $gray-50;
    cursor: pointer;
    transition: border-color $transition;
    font-family: $font;
    font-size: 12px;
    color: $gray-400;
    text-align: left;
    gap: 6px;
    &.has-value { color: $gray-900; }
    &:hover, &:focus { border-color: $blue; }
}
.select-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.select-chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: $gray-400;
    svg { width: 14px; height: 14px; }
}
.select-options {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: $white;
    border: 1.5px solid $gray-200;
    border-radius: $radius-sm;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    z-index: 50;
    list-style: none;
    margin: 0;
    padding: 4px 0;
    max-height: 220px;
    overflow-y: auto;
}
.select-option {
    padding: 8px 12px;
    font-size: 12px;
    color: $gray-700;
    cursor: pointer;
    transition: background $transition;
    &:hover { background: $gray-50; }
}
.select-option--placeholder {
    color: $gray-400;
    font-weight: 500;
}
.select-option--empty {
    color: $gray-400;
    cursor: default;
    font-style: italic;
    &:hover { background: transparent; }
}
.select-search-wrap {
    padding: 6px 8px;
    cursor: default;
    &:hover { background: transparent; }
}
.select-search-input {
    width: 100%;
    height: 30px;
    padding: 0 8px;
    border: 1px solid $gray-200;
    border-radius: $radius-xs;
    font-size: 12px;
    font-family: $font;
    color: $gray-900;
    background: $white;
    outline: none;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; }
}

/* ── DELIVERY SECTION ── */
.btn-add-location {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 600;
    font-family: $font;
    color: $blue;
    background: $blue-50;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background $transition;
    svg { width: 14px; height: 14px; }
    &:hover { background: darken($blue-50, 4%); }
}
.deliveries-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.delivery-card {
    position: relative;
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: border-color $transition;
    &:hover { border-color: $gray-300; }
}
.btn-remove-delivery {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    background: none;
    color: $gray-300;
    border-radius: $radius-xs;
    cursor: pointer;
    transition: color $transition, background $transition;
    svg { width: 15px; height: 15px; }
    &:hover { color: $red; background: rgba($red, 0.06); }
}
.delivery-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
}
.delivery-index {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: $blue-50;
    color: $blue;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.delivery-label-input {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    font-family: $font;
    color: $gray-900;
    background: transparent;
    border: none;
    border-bottom: 1px solid transparent;
    outline: none;
    padding: 2px 0;
    transition: border-color $transition;
    &:hover { border-bottom-color: $gray-300; }
    &:focus { border-bottom-color: $blue; }
    &::placeholder { color: $gray-400; font-weight: 400; }
}
.delivery-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.delivery-row-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}
.delivery-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.field-label-sm {
    font-size: 9px;
    font-weight: 700;
    color: $gray-400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.field-input-sm {
    height: 34px;
    padding: 0 10px;
    border: 1px solid $gray-200;
    border-radius: $radius-xs;
    font-size: 12px;
    font-family: $font;
    color: $gray-900;
    background: $gray-50;
    outline: none;
    transition: border-color $transition;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; background: $white; }
}
.field-select {
    height: 34px;
    padding: 0 8px;
    border: 1px solid $gray-200;
    border-radius: $radius-xs;
    font-size: 12px;
    font-family: $font;
    color: $gray-900;
    background: $gray-50;
    outline: none;
    cursor: pointer;
    transition: border-color $transition;
    &:focus { border-color: $blue; }
}
.field-textarea {
    padding: 8px 10px;
    border: 1px solid $gray-200;
    border-radius: $radius-xs;
    font-size: 12px;
    font-family: $font;
    color: $gray-900;
    background: $gray-50;
    outline: none;
    resize: none;
    transition: border-color $transition;
    &::placeholder { color: $gray-400; }
    &:focus { border-color: $blue; background: $white; }
}

/* ═══════════ BOOKINGS SECTION ═══════════ */
.booking-connect-wrap {
    position: relative;
}
.btn-connect-booking {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    font-family: $font;
    color: $white;
    background: $gray-800;
    border: none;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: background $transition;
    svg { width: 14px; height: 14px; }
    &:hover { background: $gray-700; }
}
.booking-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    width: 320px;
    background: $white;
    border: 1.5px solid $gray-200;
    border-radius: $radius;
    box-shadow: 0 6px 24px rgba(0,0,0,0.1);
    z-index: 50;
    overflow: hidden;
}
.booking-dropdown-search {
    padding: 10px;
    background: $gray-50;
    border-bottom: 1px solid $gray-100;
}
.booking-dropdown-list {
    max-height: 240px;
    overflow-y: auto;
}
.booking-dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-bottom: 1px solid $gray-50;
    background: $white;
    font-family: $font;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: background $transition;
    &:hover:not(:disabled) { background: $gray-50; }
    &.is-attached {
        opacity: 0.5;
        cursor: not-allowed;
        background: $gray-50;
    }
}
.booking-dropdown-item-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
}
.booking-bn {
    font-weight: 700;
    color: $gray-900;
    font-size: 12px;
}
.booking-title-label {
    font-size: 11px;
    color: $gray-500;
}
.booking-check-icon {
    width: 16px;
    height: 16px;
    color: $green;
    flex-shrink: 0;
}
.booking-plus-icon {
    width: 16px;
    height: 16px;
    color: $gray-400;
    flex-shrink: 0;
}
.booking-dropdown-empty {
    padding: 16px;
    text-align: center;
    font-size: 12px;
    color: $gray-400;
}

/* ── Bookings empty state ── */
.bookings-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 20px;
    border: 2px dashed $gray-200;
    border-radius: $radius;
    background: rgba($gray-50, 0.5);
}
.bookings-empty-icon {
    width: 32px;
    height: 32px;
    color: $gray-300;
    margin-bottom: 10px;
}
.bookings-empty-text {
    font-size: 13px;
    font-weight: 600;
    color: $gray-500;
    margin: 0;
}
.bookings-empty-hint {
    font-size: 11px;
    color: $gray-400;
    margin: 4px 0 0;
}

/* ── Booking block ── */
.booking-block {
    background: $white;
    border: 1px solid $gray-200;
    border-radius: $radius;
    overflow: hidden;
    margin-top: 4px;
}
.booking-block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: $gray-800;
    color: $white;
}
.booking-block-header-info {
    display: flex;
    align-items: center;
    gap: 10px;
}
.booking-block-bn {
    font-family: $font;
    font-size: 11px;
    font-weight: 600;
    background: rgba($white, 0.12);
    padding: 3px 8px;
    border-radius: $radius-xs;
}
.booking-block-title {
    font-size: 12px;
    font-weight: 500;
    opacity: 0.85;
}
.btn-detach-booking {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: rgba($white, 0.4);
    border-radius: $radius-xs;
    cursor: pointer;
    transition: color $transition, background $transition;
    svg { width: 15px; height: 15px; }
    &:hover { color: $white; background: rgba($white, 0.1); }
}

/* ── SKU block ── */
.booking-items-list {
    padding: 0;
}
.sku-block {
    padding: 16px;
    border-bottom: 1px solid $gray-100;
    &:last-child { border-bottom: none; }
}
.sku-info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}
.sku-thumb {
    width: 44px;
    height: 44px;
    border-radius: $radius-sm;
    object-fit: cover;
    border: 1px solid $gray-200;
    flex-shrink: 0;
}
.sku-thumb-placeholder {
    width: 44px;
    height: 44px;
    border-radius: $radius-sm;
    background: $gray-100;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $gray-400;
    flex-shrink: 0;
    svg { width: 22px; height: 22px; }
}
.sku-details {
    flex: 1;
    min-width: 0;
}
.sku-model {
    font-size: 13px;
    font-weight: 700;
    color: $gray-900;
}
.sku-variant {
    font-size: 11px;
    color: $gray-500;
    margin-top: 1px;
}
.sku-allocation-summary {
    text-align: right;
    flex-shrink: 0;
}
.sku-allocated-count {
    font-size: 20px;
    font-weight: 700;
    color: $gray-900;
}
.sku-total-count {
    font-size: 12px;
    font-weight: 400;
    color: $gray-400;
}
.sku-alloc-label {
    display: block;
    font-size: 9px;
    font-weight: 700;
    color: $gray-400;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.alloc-full .sku-allocated-count { color: $green; }
.alloc-over .sku-allocated-count { color: $red; }
.alloc-partial .sku-allocated-count { color: $gray-900; }

/* ── Allocation table ── */
.alloc-table {
    background: $gray-50;
    border: 1px solid $gray-200;
    border-radius: $radius-sm;
    overflow: hidden;
}
.alloc-table-head {
    display: grid;
    grid-template-columns: 90px 1fr 1fr 1fr 70px;
    gap: 8px;
    padding: 6px 12px;
    border-bottom: 1px solid $gray-200;
}
.alloc-th {
    font-size: 9px;
    font-weight: 700;
    color: $gray-400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.alloc-th-action { text-align: center; }
.alloc-table-body {
    display: flex;
    flex-direction: column;
}
.alloc-row {
    display: grid;
    grid-template-columns: 90px 1fr 1fr 1fr 70px;
    gap: 8px;
    padding: 8px 12px;
    align-items: start;
    border-bottom: 1px solid $gray-100;
    transition: background $transition;
    &:last-child { border-bottom: none; }
    &:hover { background: $white; }
    &.alloc-row--split {
        border-left: 3px solid $blue;
    }
}
.alloc-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.alloc-cell-action {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 4px;
}
.alloc-qty-input {
    width: 72px;
    height: 32px;
    border: 1px solid $gray-300;
    border-radius: $radius-xs;
    text-align: center;
    font-family: $font;
    font-size: 12px;
    font-weight: 600;
    color: $gray-900;
    background: $white;
    outline: none;
    transition: border-color $transition;
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    &:focus { border-color: $blue; }
}
.alloc-split-label {
    font-size: 9px;
    color: $gray-400;
}
.alloc-select {
    width: 100%;
    height: 32px;
    padding: 0 6px;
    border: 1px solid $gray-300;
    border-radius: $radius-xs;
    font-size: 11px;
    font-family: $font;
    color: $gray-900;
    background: $white;
    outline: none;
    cursor: pointer;
    transition: border-color $transition;
    &:focus { border-color: $blue; }
}
.alloc-dest-type {
    font-size: 9px;
    color: $gray-400;
}
.alloc-mockup-input {
    width: 100%;
    height: 26px;
    padding: 0 6px;
    border: none;
    border-bottom: 1px solid $gray-200;
    font-size: 11px;
    font-family: $font;
    color: $gray-700;
    background: transparent;
    outline: none;
    transition: border-color $transition;
    &::placeholder { color: $gray-400; }
    &:focus { border-bottom-color: $blue; }
}
.alloc-labor-check {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 11px;
    color: $gray-600;
    input[type="checkbox"] {
        width: 14px;
        height: 14px;
        accent-color: $blue;
        cursor: pointer;
    }
}
.btn-split {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: $blue-50;
    color: $blue;
    border-radius: $radius-xs;
    cursor: pointer;
    transition: background $transition;
    svg { width: 14px; height: 14px; }
    &:hover { background: darken($blue-50, 6%); }
}
.btn-remove-alloc {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: $gray-400;
    border-radius: $radius-xs;
    cursor: pointer;
    transition: color $transition, background $transition;
    svg { width: 14px; height: 14px; }
    &:hover { color: $red; background: rgba($red, 0.06); }
}

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 768px) {
    .meta-grid { grid-template-columns: 1fr; }
    .meta-field--full { grid-column: 1; }
    .deliveries-grid { grid-template-columns: 1fr; }
    .alloc-table-head,
    .alloc-row {
        grid-template-columns: 1fr;
        gap: 6px;
    }
    .alloc-table-head { display: none; }
    .alloc-row {
        padding: 12px;
    }
    .alloc-cell-action {
        justify-content: flex-start;
    }
    .top-bar {
        flex-wrap: wrap;
        height: auto;
        padding: 10px 14px;
        gap: 8px;
    }
    .top-bar-actions {
        width: 100%;
        justify-content: flex-end;
    }
    .form-content {
        padding: 16px 12px 48px;
    }
    .booking-dropdown {
        width: 280px;
    }
}

@media (max-width: 480px) {
    .delivery-row-2col { grid-template-columns: 1fr; }
    .top-bar-actions {
        flex-direction: column;
    }
    .btn-draft, .btn-submit {
        width: 100%;
        text-align: center;
    }
}
</style>
