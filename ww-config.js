export default {
    editor: {
        label: { en: 'Order Plan Manager' },
        icon: 'document',
        customSettingsPropertiesOrder: [
            {
                label: 'Editing Context',
                isCollapsible: true,
                properties: ['editingHeaderId', 'actionStatus'],
            },
            {
                label: 'Order Plan Data (for Edit Mode)',
                isCollapsible: true,
                properties: [
                    'orderplanHeadersData',
                    'orderplanDeliveriesData',
                    'orderplanAttBookingsData',
                    'orderplanLinesData',
                ],
            },
            {
                label: 'Booking Data Sources',
                isCollapsible: true,
                properties: ['bookingHeaders', 'bookingItems'],
            },
            {
                label: 'Reference Data',
                isCollapsible: true,
                properties: ['inventoryData', 'teammatesList'],
            },
        ],
    },
    triggerEvents: [
        {
            name: 'onSaveDraft',
            label: { en: 'On Save Draft' },
            event: {
                value: {
                    action: 'save_draft',
                    orderplan_headers: {
                        id: null,
                        opid: null,
                        title: null,
                        pic_bda: null,
                        pic_ops: null,
                        quoteref: null,
                        invoiceref: null,
                        status: 'Draft',
                        updated_at: null,
                        created_at: null,
                    },
                    orderplan_attbookings: [
                        { id: null, headerid: null, booking_headerid: null },
                    ],
                    orderplan_deliveries: [
                        { id: null, headerid: null, label: null, deliverytype: null, address: null, remarks: null, pic_name: null, pic_phone: null, deadline: null, _uid: null },
                    ],
                    orderplan_lines: [
                        { id: null, headerid: null, bookingitems_headerid: null, deliveries_headerid: null, _deliveries_uid: null, customization: null, quantity_assigned: null, splitgroupid: null, mockup_link: null, labor: null },
                    ],
                    changes: {},
                },
            },
            default: true,
        },
        {
            name: 'onSubmitProcessing',
            label: { en: 'On Submit for Processing' },
            event: {
                value: {
                    action: 'request_process',
                    orderplan_headers: {
                        id: null,
                        opid: null,
                        title: null,
                        pic_bda: null,
                        pic_ops: null,
                        quoteref: null,
                        invoiceref: null,
                        status: 'Submitted',
                        updated_at: null,
                        created_at: null,
                        submitted_at: null,
                    },
                    orderplan_attbookings: [
                        { id: null, headerid: null, booking_headerid: null },
                    ],
                    orderplan_deliveries: [
                        { id: null, headerid: null, label: null, deliverytype: null, address: null, remarks: null, pic_name: null, pic_phone: null, deadline: null, _uid: null },
                    ],
                    orderplan_lines: [
                        { id: null, headerid: null, bookingitems_headerid: null, deliveries_headerid: null, _deliveries_uid: null, customization: null, quantity_assigned: null, splitgroupid: null, mockup_link: null, labor: null },
                    ],
                    changes: {},
                },
            },
            default: false,
        },
        {
            name: 'onDelete',
            label: { en: 'On Delete' },
            event: {
                value: {
                    headerId: null,
                    opid: null,
                    title: null,
                },
            },
            default: false,
        },
    ],
    properties: {
        editingHeaderId: {
            label: { en: 'Editing Header ID' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'UUID of an existing orderplan_headers row to edit. Leave empty for create mode.',
            },
            /* wwEditor:end */
        },
        actionStatus: {
            label: { en: 'Action Status' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Set to "successful" or "failed" after a save/submit/delete action. Null or empty = idle.',
            },
            /* wwEditor:end */
        },
        orderplanHeadersData: {
            label: { en: 'Order Plan Headers' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of orderplan_headers rows: { id, opid, title, pic_bda, pic_ops, quoteref, invoiceref, status, created_at, updated_at }',
            },
            /* wwEditor:end */
        },
        orderplanDeliveriesData: {
            label: { en: 'Order Plan Deliveries' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of orderplan_deliveries rows: { id, headerid, label, deliverytype, address, remarks, pic_name, pic_phone, deadline }',
            },
            /* wwEditor:end */
        },
        orderplanAttBookingsData: {
            label: { en: 'Order Plan Attached Bookings' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of orderplan_attbookings rows: { id, headerid, booking_headerid }',
            },
            /* wwEditor:end */
        },
        orderplanLinesData: {
            label: { en: 'Order Plan Lines' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of orderplan_lines rows: { id, headerid, bookingitems_headerid, deliveries_headerid, customization, quantity_assigned, splitgroupid }',
            },
            /* wwEditor:end */
        },
        bookingHeaders: {
            label: { en: 'Booking Headers' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of booking_headers: { id, bookingnumber, bookingtitle, pic_id, created_at }',
            },
            /* wwEditor:end */
        },
        bookingItems: {
            label: { en: 'Booking Items' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of booking_items: { id, headerid, sku, quantity, status }',
            },
            /* wwEditor:end */
        },
        inventoryData: {
            label: { en: 'Inventory Data' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of inventory_data: { sku, type, model, color, size, tags, snt, imagelink }',
            },
            /* wwEditor:end */
        },
        teammatesList: {
            label: { en: 'Teammates List' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of teammates: { id, name, type, email, phone }',
            },
            /* wwEditor:end */
        },
    },
};
