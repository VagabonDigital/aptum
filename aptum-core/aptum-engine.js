/* ==========================================================================
   APTUM · CORE ENGINE
   Shared Renderer & Interaction Layer
   --------------------------------------------------------------------------
   Generates Aptum module pages from module-data.js.
   Controls navigation, jump menu, progress state, practice tabs, accordions,
   expandable cards, quick reference, and shared module behaviours.
   --------------------------------------------------------------------------
   UNA FORMA · MULTA EXEMPLA · SYSTEMA MANET
   ========================================================================== */

(function () {
    'use strict';

    const MODULE = window.APTUM_MODULE || {};
    const root = document.getElementById('aptum-root');

    if (!root) {
        console.error('Aptum error: #aptum-root not found.');
        return;
    }

    const PAGE_TITLES = MODULE.pageTitles || {};
    const SECTIONS = getSections();
    const SECTION_STARTS = getSectionStarts(SECTIONS);
    const TOTAL = getTotalPages();
    const CONTINUE_LABELS = MODULE.continueLabels || {};
    const QUICK_REF_HEADER_PAGE = MODULE.quickReferenceHeaderPage || SECTION_STARTS[SECTION_STARTS.length - 1] || 1;

    const SUGGESTED_NEXT_MODULES = {
        discovery: {
            icon: "discovery",
            kicker: "Next Path",
            title: "Discovery Call Foundations"
        },
        objection: {
            icon: "objection",
            kicker: "Next Path",
            title: "Objection Handling"
        },
        value: {
            icon: "value",
            kicker: "Next Path",
            title: "Explaining Value Clearly"
        },
        followup: {
            icon: "followup",
            kicker: "Next Path",
            title: "Follow-Up and Next Steps"
        },
        "client-call": {
            icon: "client-call",
            kicker: "Confidence",
            title: "Client Call Confidence"
        },
        senior: {
            icon: "senior",
            kicker: "Next Path",
            title: "Sounding Senior and In Control"
        },
        meeting: {
            icon: "meeting",
            kicker: "Next Path",
            title: "Meeting Participation"
        },
        present: {
            icon: "present",
            kicker: "Structured",
            title: "Presentation and Q&A Structure"
        },
        pressure: {
            icon: "pressure",
            kicker: "Next Path",
            title: "Fluency Under Pressure"
        },
        negotiation: {
            icon: "negotiation",
            kicker: "Difficult",
            title: "Negotiation and Difficult Conversations"
        },
        rapport: {
            icon: "rapport",
            kicker: "Next Path",
            title: "Rapport and Professional Tone"
        },
        smalltalk: {
            icon: "smalltalk",
            kicker: "Next Path",
            title: "Small Talk to Business"
        },
        "sales-interview": {
            icon: "sales-interview",
            kicker: "Next Path",
            title: "Sales Interview Prep"
        },
        "cross-cultural": {
            icon: "cross-cultural",
            kicker: "Next Path",
            title: "Cross-Cultural Business Communication"
        }
    };

    let cur = Number(MODULE.initialPage) || 1;
    let quickRefActive = false;

    /* ==========================================================================
       CORE HELPERS
       ========================================================================== */

    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function icon(name, width, height) {
        return '<svg width="' + width + '" height="' + height + '" aria-hidden="true"><use href="#icon-' + esc(name) + '"/></svg>';
    }

    function getSections() {
        const sections = Array.isArray(MODULE.sections) ? MODULE.sections : [];

        if (sections.length) {
            return sections.map(function (section, index) {
                return {
                    label: section.label || 'Section ' + (index + 1),
                    page: Number(section.page) || 1
                };
            });
        }

        return [
            { label: "Start", page: 1 }
        ];
    }

    function getSectionStarts(sections) {
        if (Array.isArray(MODULE.sectionStarts) && MODULE.sectionStarts.length) {
            return MODULE.sectionStarts
                .map(Number)
                .filter(function (page) {
                    return Number.isInteger(page) && page > 0;
                });
        }

        return sections.map(function (section) {
            return Number(section.page) || 1;
        });
    }

    function getTotalPages() {
        const explicit = Number(MODULE.totalPages);

        if (Number.isInteger(explicit) && explicit > 0) {
            return explicit;
        }

        const pages = [];

        Object.keys(PAGE_TITLES).forEach(function (key) {
            const page = Number(key);
            if (Number.isInteger(page) && page > 0) pages.push(page);
        });

        SECTIONS.forEach(function (section) {
            const page = Number(section.page);
            if (Number.isInteger(page) && page > 0) pages.push(page);
        });

        if (Array.isArray(MODULE.skills)) {
            MODULE.skills.forEach(function (skill) {
                const page = Number(skill.page);
                if (Number.isInteger(page) && page > 0) pages.push(page);
            });
        }

        [
            'putItTogether',
            'completion',
            'prepMoment',
            'getTheWords',
            'compareStrongVersion'
        ].forEach(function (key) {
            const page = Number((MODULE[key] || {}).page);
            if (Number.isInteger(page) && page > 0) pages.push(page);
        });

        if (Array.isArray(MODULE.jumpMenu)) {
            MODULE.jumpMenu.forEach(function (group) {
                (group.links || []).forEach(function (link) {
                    const page = Number(link.page);
                    if (Number.isInteger(page) && page > 0) pages.push(page);
                });
            });
        }

        return pages.length ? Math.max.apply(null, pages) : 1;
    }

    /* ==========================================================================
       ICON LIBRARY
       --------------------------------------------------------------------------
       Shared UI icons = used by engine components
       Module brand icons = one per Aptum module, selected by MODULE.icon
       Study tool icons = used by overview support cards
       ========================================================================== */

    function renderIconLibrary() {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">

                <!-- ==========================================================
                    SHARED UI ICONS
                    ========================================================== -->

                <symbol id="icon-check" viewBox="0 0 10 10">
                    <path d="M2 5.5l2 2L8 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-check-lg" viewBox="0 0 11 11">
                    <path d="M2 5.5l2.5 2.5L9 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-check-sm" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-bulb" viewBox="0 0 14 14">
                    <path d="M7 2a3.5 3.5 0 0 1 2 6.4V10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8.4A3.5 3.5 0 0 1 7 2z" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M5.5 12h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-target" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" opacity="0.6" fill="none"/>
                    <circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.3" opacity="0.8" fill="none"/>
                    <circle cx="7" cy="7" r="1" fill="currentColor"/>
                </symbol>

                <symbol id="icon-chevron-down" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-arrow-right" viewBox="0 0 14 14">
                    <path d="M5 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-arrow-right-wide" viewBox="0 0 16 16">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-external-link" viewBox="0 0 16 16">
                    <path d="M6.5 4.5H4.5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 3h4v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 3L8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-arrow-right-bonus" viewBox="0 0 15 15">
                    <path d="M3 7.5h9M8 3.5l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-arrow-left" viewBox="0 0 14 14">
                    <path d="M9 3L5 7l4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-list" viewBox="0 0 14 14">
                    <path d="M2 4h10M2 7h7M2 10h5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-circle-check" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M4 6l1.5 1.5L8 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-print" viewBox="0 0 15 15">
                    <path d="M4 5V2h7v3M4 10H2V6h11v4h-2M4 10v3h7v-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-doc-plus" viewBox="0 0 13 13">
                    <rect x="1.5" y="1.5" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M4 6.5h5M6.5 4v5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </symbol>


                <!-- ==========================================================
                    MODULE BRAND ICONS
                    Selected by module-data.js:
                    icon: "objection"
                    icon: "discovery"
                    icon: "value"
                    icon: "followup"
                    icon: "client-call"
                    icon: "present"
                    icon: "smalltalk"
                    ========================================================== -->

                <symbol id="icon-objection" viewBox="0 0 20 20">
                    <path d="M10 2L4 5v5c0 3.5 2.5 6.5 6 7.5C14.5 16.5 17 13.5 17 10V5L10 2z"
                        fill="none" stroke="white" stroke-width="1.3" stroke-linejoin="round" opacity="0.7" />
                    <path d="M7.5 10l2 2 3-3"
                        fill="none" stroke="#3AACA3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </symbol>

                <symbol id="icon-discovery" viewBox="0 0 20 20">
                    <circle cx="9" cy="9" r="5.5" fill="none" stroke="white" stroke-width="1.4" opacity="0.75"/>
                    <path d="M13.5 13.5L17 17" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.75"/>
                    <path d="M7 9h4M9 7v4" stroke="#3AACA3" stroke-width="1.4" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-value" viewBox="0 0 20 20">
                    <path d="M10 3l2 4 4.5.6-3.2 3.2.75 4.5L10 13l-4.05 2.3.75-4.5L3.5 7.6 8 7z"
                        fill="none" stroke="white" stroke-width="1.3" stroke-linejoin="round" opacity="0.7"/>
                    <path d="M7.5 10l2 2 3-3"
                        stroke="#3AACA3" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-followup" viewBox="0 0 20 20">
                    <path d="M3 7h9M3 11h6"
                        stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>
                    <circle cx="15" cy="14" r="3"
                        fill="none" stroke="#3AACA3" stroke-width="1.4"/>
                    <path d="M15 12.5v1.5l1 1"
                        stroke="#3AACA3" stroke-width="1.3" stroke-linecap="round"/>
                    <rect x="2" y="4" width="16" height="12" rx="2"
                        fill="none" stroke="white" stroke-width="1.3" opacity="0.35"/>
                </symbol>

                <symbol id="icon-client-call" viewBox="0 0 20 20">
                    <path d="M4 10 Q4 4 10 4 Q16 4 16 10" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <rect x="2.5" y="9.5" width="3" height="5" rx="1.5" fill="none" stroke="white" stroke-width="1.4"/>
                    <rect x="14.5" y="9.5" width="3" height="5" rx="1.5" fill="none" stroke="white" stroke-width="1.4"/>
                    <path d="M17 14.5 Q17 17 14 17 L11 17" fill="none" stroke="white" stroke-width="1.4" stroke-linecap="round"/>
                    <circle cx="10" cy="17.5" r="1.2" fill="#3AACA3"/>
                </symbol>

                <symbol id="icon-present" viewBox="0 0 20 20">
                    <rect x="2" y="3" width="16" height="11" rx="2" fill="none" stroke="white" stroke-width="1.3" opacity="0.7"/>
                    <path d="M10 14v3M7 17h6" stroke="white" stroke-width="1.3" stroke-linecap="round" opacity="0.55"/>
                    <path d="M6 10l2-3 2 2 2-3 2 2" stroke="#3AACA3" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-smalltalk" viewBox="0 0 20 20">
                    <path d="M4 5h8a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 2v-2H4a2 2 0 01-2-2V7a2 2 0 012-2z"
                        fill="none" stroke="white" stroke-width="1.3" opacity="0.7"/>
                    <path d="M10 10h6a2 2 0 002-2V5a2 2 0 00-2-2h-3"
                        fill="none" stroke="#3AACA3" stroke-width="1.3" opacity="0.7"/>
                </symbol>



                <!-- ==========================================================
                    SUGGESTED MODULE CARD ICONS
                    Used by completion.suggestedNext[].icon
                    ========================================================== -->

                <symbol id="icon-next-roadmap" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
                    <rect x="14" y="4" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.55"/>
                    <rect x="4" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.55"/>
                    <rect x="14" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
                </symbol>

                <symbol id="icon-next-objection" viewBox="0 0 24 24">
                    <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 3v-3H6a2 2 0 0 1-2-2V6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="M9 10h6M12 7v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-discovery" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M17 17l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M8 11h6M11 8v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-value" viewBox="0 0 24 24">
                    <path d="M3 13c3 0 4-6 7-6s4 6 7 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <circle cx="3" cy="13" r="1.5" fill="currentColor"/>
                    <circle cx="17" cy="13" r="1.5" fill="currentColor"/>
                    <path d="M10 7V4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <circle cx="10" cy="3" r="1.2" fill="currentColor"/>
                </symbol>

                <symbol id="icon-next-followup" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-client-call" viewBox="0 0 24 24">
                    <path d="M12 3C7 3 3 7 3 12c0 1.5.4 3 1 4.2L3 21l4.8-1C9 20.6 10.5 21 12 21c5 0 9-4 9-9s-4-9-9-9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="M9 11h6M9 14h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-senior" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-next-meeting" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-present" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M7 21h10M12 17v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M8 8l2 3 2-2 2 3 2-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-next-pressure" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-next-negotiation" viewBox="0 0 24 24">
                    <path d="M12 3l-8 4v5c0 4 3 7.5 8 9 5-1.5 8-5 8-9V7l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-next-rapport" viewBox="0 0 24 24">
                    <path d="M7 8.5C7 6.6 8.6 5 10.5 5S14 6.6 14 8.5 12.4 12 10.5 12 7 10.4 7 8.5z" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M14.5 10.5c1.5 0 2.7-1.2 2.7-2.7s-1.2-2.7-2.7-2.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M4.5 19c.7-2.4 2.9-4 6-4s5.3 1.6 6 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <path d="M16.5 15.2c1.7.5 2.9 1.8 3.3 3.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-smalltalk" viewBox="0 0 24 24">
                    <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </symbol>

                <symbol id="icon-next-sales-interview" viewBox="0 0 24 24">
                    <rect x="4" y="3" width="16" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <circle cx="12" cy="9" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M7.8 17c.7-2.2 2.2-3.4 4.2-3.4s3.5 1.2 4.2 3.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-next-cross-cultural" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
                    <path d="M3.5 12h17" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M12 3.5c2.3 2.3 3.4 5.1 3.4 8.5s-1.1 6.2-3.4 8.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M12 3.5C9.7 5.8 8.6 8.6 8.6 12s1.1 6.2 3.4 8.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M5.8 7.2h12.4M5.8 16.8h12.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
                </symbol>

                <symbol id="icon-next-target" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
                    <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.8"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                </symbol>                


                <!-- ==========================================================
                    STUDY TOOL ICONS
                    ========================================================== -->

                <symbol id="icon-podcast" viewBox="0 0 20 20">
                    <circle cx="10" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
                    <path d="M5.5 8a4.5 4.5 0 0 0 9 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M3 8a7 7 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
                    <line x1="10" y1="12.5" x2="10" y2="17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    <path d="M7.5 17h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </symbol>

                <symbol id="icon-mindmap" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
                    <circle cx="3.5" cy="5" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <circle cx="3.5" cy="15" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <circle cx="16.5" cy="5" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <circle cx="16.5" cy="15" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
                    <line x1="7.7" y1="8.4" x2="4.8" y2="6.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="7.7" y1="11.6" x2="4.8" y2="13.9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="12.3" y1="8.4" x2="15.2" y2="6.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    <line x1="12.3" y1="11.6" x2="15.2" y2="13.9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </symbol>

            </svg>
        `;
    }

    /* ==========================================================================
       SHELL RENDERERS
       ========================================================================== */

    function renderPage(pageNumber, body) {
        const active = Number(pageNumber) === cur ? ' active' : '';
        return '<div class="page' + active + '" id="page-' + Number(pageNumber) + '">' + body + '</div>';
    }

    function renderTopBar() {
        const sections = SECTIONS;

        const progress = sections.map(function (section, index) {
            const connector = index < sections.length - 1
                ? '<div class="sec-connector" id="conn-' + index + '"></div>'
                : '';

            return `
                <div class="sec-step clickable" id="sec-${index}" onclick="goToPage(${Number(section.page) || 1})">
                    <div class="sec-dot">${index + 1}</div>
                    <span class="sec-label">${esc(section.label)}</span>
                </div>
                ${connector}
            `;
        }).join('');

        return `
            <header class="top-bar">
                <div class="top-bar-inner">
                    <div class="brand">
                        <div class="brand-icon">
                            ${icon(MODULE.icon || 'present', 20, 20)}
                        </div>
                        <div>
                            <div class="brand-name">${esc(MODULE.title)}</div>
                            <div class="brand-sub">${esc(MODULE.subtitle)}</div>
                        </div>
                    </div>
                    <nav class="section-progress" id="sectionProgress">
                        ${progress}
                    </nav>
                </div>
            </header>
        `;
    }

    function renderBottomBar() {
        return `
            <div class="bottom-bar hidden" id="bottomBar">
                <div class="bottom-left">
                    <button class="btn-back" id="btnBack" onclick="handleBack()">
                        ${icon('arrow-left', 14, 14)}
                        Back
                    </button>

                    <span class="page-indicator" id="pageIndicator">
                        <span class="page-count-desktop">Page 1 of ${TOTAL}</span>
                        <span class="page-count-mobile">1/${TOTAL}</span>
                    </span>
                </div>

                <div class="bottom-right">
                    <button class="btn-jump" id="btnJump" onclick="toggleJump()">
                        ${icon('list', 14, 14)}
                        Jump to
                    </button>

                    <button class="btn-continue" id="btnContinue" onclick="handleContinue()">
                        Continue
                        ${icon('arrow-right', 14, 14)}
                    </button>
                </div>
            </div>
        `;
    }

    function renderJumpPanel() {
        const groups = Array.isArray(MODULE.jumpMenu) ? MODULE.jumpMenu : [];

        return `
            <div class="jump-overlay" id="jumpOverlay" onclick="closeJump()"></div>

            <div class="jump-panel" id="jumpPanel">
                <div class="jump-panel-inner">
                    ${groups.map(function (group) {
            return `
                            <div class="jump-section-label">${esc(group.label)}</div>
                            <div class="jump-links">
                                ${(group.links || []).map(function (link) {
                const id = link.quickReference ? ' id="qr-jump-link"' : '';
                const action = link.quickReference
                    ? 'jumpToQuickReference()'
                    : 'jumpTo(' + Number(link.page) + ')';

                return `
                                        <button class="jump-link"${id} onclick="${action}">
                                            <span class="jump-link-title">${esc(link.title)}</span>
                                            <span class="jump-link-desc">${esc(link.desc)}</span>
                                        </button>
                                    `;
            }).join('')}
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    /* ==========================================================================
       CORE FLOW RENDERERS
       ========================================================================== */

    function renderLanding(pageNumber) {
        const data = MODULE.landing || {};
        const flow = Array.isArray(data.flow) ? data.flow : [];

        const flowHtml = flow.map(function (item, index) {
            const isLast = index === flow.length - 1;
            const highlightItem = data.highlightFlowItem || data.highlightFlow || '';
            const cls = item === highlightItem ? ' hl' : isLast ? ' teal' : '';
            const arrow = isLast ? '' : '<span class="flow-arrow">→</span>';

            return `
                <div class="flow-step">
                    <div class="flow-pill${cls}">${esc(item)}</div>
                    ${arrow}
                </div>
            `;
        }).join('');

        return renderPage(pageNumber, `
            <div style="text-align:center;padding:20px 0 48px">
                <div class="page-eyebrow">
                    ${icon('circle-check', 12, 12)}
                    ${esc(data.eyebrow)}
                </div>

                <h1 class="hero-title" style="max-width:620px;margin:0 auto 16px">
                    ${data.title || ''}
                </h1>

                <p class="hero-sub" style="margin:0 auto 12px">${esc(data.subtitle)}</p>
                <p class="hero-body" style="margin:0 auto 36px">${esc(data.body)}</p>

                <div class="flow-visual">
                    ${flowHtml}
                </div>

                <button class="btn-primary" onclick="goToPage(${Number(data.startPage) || 2})">
                    Start Module
                    ${icon('arrow-right-wide', 16, 16)}
                </button>

                <div class="landing-meta">
                    ${esc(data.meta).split('·').map(function (part, i, arr) {
            return '<span>' + part.trim() + '</span>' + (i < arr.length - 1 ? '<span class="landing-meta-dot">·</span>' : '');
        }).join('')}
                </div>
            </div>
        `);
    }

    function renderOverview(pageNumber) {
        const data = MODULE.overview || {};
        const paragraphs = Array.isArray(data.introParagraphs) ? data.introParagraphs : [];
        const buildList = Array.isArray(data.buildList) ? data.buildList : [];
        const tools = Array.isArray(data.studyTools) ? data.studyTools : [];

        return renderPage(pageNumber, `
            <div class="page-eyebrow">${esc(data.eyebrow)}</div>
            <h1 class="page-title">${esc(data.title)}</h1>
            <p class="page-subtitle">${esc(data.subtitle)}</p>

            <div class="two-col mt-8 overview-grid">
                <div class="overview-left-col">
                    <div class="card overview-intro-card">
                        <div class="section-label mb-8">${esc(data.introTitle)}</div>
                        ${paragraphs.map(function (p) {
            return '<p class="overview-intro-p">' + esc(p) + '</p>';
        }).join('')}
                    </div>

                    <div class="card card-navy mt-12">
                        <div class="section-label on-dark">${esc(data.pathTitle)}</div>
                        <div style="font-size:22px;font-weight:700;color:white;margin-bottom:4px">${esc(data.pathValue)}</div>
                        <div style="font-size:13px;color:rgba(255,255,255,0.55)">${esc(data.pathNote)}</div>
                    </div>
                </div>

                <div class="card overview-build-card">
                    <div class="section-label mb-8">${esc(data.buildTitle)}</div>

                    <ul class="build-list">
                        ${buildList.map(function (item) {
            return `
                                <li>
                                    <div class="build-dot">${icon('check', 10, 10)}</div>
                                    ${esc(item)}
                                </li>
                            `;
        }).join('')}
                    </ul>

                    ${data.buildNote ? `
                        <div class="overview-build-note">
                            <div class="overview-build-note-label">${esc(data.buildNote.label || 'Core result')}</div>
                            <div class="overview-build-note-text">${esc(data.buildNote.text || '')}</div>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${renderStudyTools(tools)}
        `);
    }

    function renderStudyTools(tools) {
        if (!tools.length) return '';

        return `
            <div class="study-tools">
                <div class="study-tools-label">Study Tools</div>
                <div class="study-tools-grid">
                    ${tools.map(function (tool) {
            const toolIcon = tool.type === 'audio' ? 'podcast' : 'mindmap';

            let action = '';

            if (tool.type === 'audio') {
                action = `
                                <audio class="study-tool-audio" controls preload="metadata">
                                    <source src="${esc(tool.src)}" type="audio/mp4">
                                    Your browser does not support the audio element.
                                </audio>
                            `;
            }

            if (tool.type === 'link') {
                action = `
                                <a class="study-tool-link" href="${esc(tool.href)}" target="_blank" rel="noopener">
                                    ${icon('external-link', 16, 16)}
                                    ${esc(tool.label)}
                                </a>
                            `;
            }

            return `
                            <div class="study-tool-card">
                                <div class="study-tool-header">
                                    <div class="study-tool-icon">${icon(toolIcon, 20, 20)}</div>
                                    <div>
                                        <div class="study-tool-kicker">${esc(tool.kicker)}</div>
                                        <div class="study-tool-title">${esc(tool.title)}</div>
                                    </div>
                                </div>
                                <div class="study-tool-desc">${esc(tool.desc)}</div>
                                ${action}
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    function renderHowThisWorks(pageNumber) {
        const data = MODULE.howThisWorks || {};
        const steps = Array.isArray(data.steps) ? data.steps : [];

        return renderPage(pageNumber, `
            <div class="page-eyebrow">${esc(data.eyebrow)}</div>
            <h1 class="page-title">${esc(data.title)}</h1>
            <p class="page-subtitle">${esc(data.subtitle)}</p>

            <div class="skill-stack mt-8">
                ${steps.map(function (step) {
            return `
                        <div class="skill-stack-item">
                            <div class="skill-num${step.teal ? ' teal' : ''}">${esc(step.num)}</div>
                            <div>
                                <div class="skill-stack-title">${esc(step.title)}</div>
                                <div class="skill-stack-desc">${esc(step.desc)}</div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>

            <div class="guidance-note mt-20">
                <div class="guidance-note-label">${esc(data.noteLabel)}</div>
                <div class="guidance-note-text">${esc(data.note)}</div>
            </div>
        `);
    }

    function renderFramework(pageNumber) {
        const data = MODULE.framework || {};
        const path = Array.isArray(data.path) ? data.path : [];
        const steps = Array.isArray(data.steps) ? data.steps : [];

        return renderPage(pageNumber, `
            <div class="page-eyebrow">${esc(data.eyebrow)}</div>
            <h1 class="page-title">${esc(data.title)}</h1>
            <p class="page-subtitle">${esc(data.subtitle)}</p>

            <div class="memory-bar mt-16">
                <span class="memory-bar-label">${esc(data.pathLabel)}</span>
                ${path.map(function (item, index) {
            const arrow = index < path.length - 1 ? '<span class="memory-arrow">→</span>' : '';
            return '<span class="memory-pill">' + esc(item) + '</span>' + arrow;
        }).join('')}
            </div>

            <div class="framework-steps">
                ${steps.map(function (step) {
            return `
                        <div class="fw-step">
                            <div class="fw-num${step.teal ? ' teal' : ''}">${esc(step.num)}</div>
                            <div>
                                <div class="fw-label">${esc(step.label)}</div>
                                <div class="fw-title">${esc(step.title)}</div>
                                <div class="skill-stack-desc">${esc(step.desc)}</div>
                                <div class="fw-phrase">${esc(step.phrase)}</div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>

            <div class="framework-takeaway mt-16">
                <div>
                    <div class="framework-takeaway-label">${esc(data.takeawayLabel)}</div>
                    <div class="framework-takeaway-text">${esc(data.takeaway)}</div>
                </div>
            </div>
        `);
    }

    function renderControlMap(pageNumber) {
        const data = MODULE.controlMap || {};
        const items = Array.isArray(data.items) ? data.items : [];
        const selectedIndex = Number.isInteger(data.defaultItem) ? data.defaultItem : 0;
        const selectedItem = items[selectedIndex] || items[0] || {};

        return renderPage(pageNumber, `
        <div class="page-eyebrow">${esc(data.eyebrow)}</div>
        <h1 class="page-title">${esc(data.title)}</h1>
        <p class="page-subtitle">${esc(data.subtitle)}</p>
        <div class="section-label mt-24 mb-12">
            ${esc(data.patternLabel || 'Review common patterns')}
        </div>

        <section class="control-map-compact">
            <div class="control-map-choice-grid">
                ${items.map(function (item, index) {
            return `
                        <button class="control-map-choice${index === selectedIndex ? ' active' : ''}" onclick="selectControlMapPattern(this, ${index})">
                            <span class="control-map-choice-type">${esc(item.type)}</span>
                            <span class="control-map-choice-title">${esc(item.weakPattern)}</span>
                        </button>
                    `;
        }).join('')}
            </div>

            <section class="control-map-result" id="controlMapDetailPanel">
                ${renderControlMapDetail(selectedItem)}
            </section>
        </section>

        <div class="guidance-note mt-16">
            <div class="guidance-note-label">${esc(data.noteLabel)}</div>
            <div class="guidance-note-text">${esc(data.note)}</div>
        </div>

        ${data.optionalQuestion ? `
            <div class="optional-q">
                <div class="optional-q-label">${esc(data.optionalQuestionLabel || 'Optional — quick question')}</div>
                <div class="optional-q-text">${esc(data.optionalQuestion)}</div>
            </div>
        ` : ''}
    `);
    }

    function renderControlMapDetail(item) {
        if (!item) return '';

        return `
        <div class="control-result-head">
            <div>
                <div class="control-result-kicker">${esc(item.type || '')}</div>
                <h2 class="control-result-title">${esc(item.quote || '')}</h2>
            </div>

            <button class="control-result-action" onclick="goToPage(${Number(item.page) || 1})">
                ${esc(item.button || 'Go to skill')}
            </button>
        </div>

        <div class="control-result-grid">
            <div class="control-result-card weak">
                <div class="control-result-label">Weak pattern</div>
                <div class="control-result-short">${esc(item.weakPattern || '')}</div>
                <p>${esc(item.detail || '')}</p>
            </div>

            <div class="control-result-card strong">
                <div class="control-result-label">Better move</div>
                <p>${esc(item.betterMove || '')}</p>
                <div class="control-result-pill">${esc(item.move || '')}</div>
            </div>
        </div>
    `;
    }

    function renderSkillPage(skill) {
        const pageNumber = Number(skill.page);
        const practice = skill.practice || {};
        const tabs = Array.isArray(practice.tabs) ? practice.tabs : [];
        const phrases = Array.isArray(practice.phrases) ? practice.phrases : [];
        const checks = Array.isArray(practice.check) ? practice.check : [];

        return renderPage(pageNumber, `
        <div class="skill-hero">
            <div class="skill-number-badge">${esc(skill.number)}</div>
            <h1 class="skill-title">${esc(skill.title)}</h1>
            <div class="skill-key-move">
                Key Move:
                <span class="key-move-hl">${esc(skill.keyMove)}</span>
            </div>
        </div>

        <div class="mt-14">
            <div class="info-block">
                <div class="info-block-label">Why this matters</div>
                <div class="info-block-text">${esc(skill.why)}</div>
            </div>
        </div>

        <div class="info-block mt-14">
            <div class="info-block-label">Weak → Stronger</div>
            <div class="ws-grid">
                <div class="ws-card weak">
                    <div class="ws-tag">Weak</div>
                    <div class="ws-text">${esc((skill.weakStrong || {}).weak)}</div>
                </div>
                <div class="ws-card strong">
                    <div class="ws-tag">Stronger</div>
                    <div class="ws-text">${esc((skill.weakStrong || {}).stronger)}</div>
                </div>
            </div>
        </div>

        <div class="principle-block">
            <div class="principle-icon">
                ${icon('bulb', 14, 14)}
            </div>
            <div class="principle-text">${esc(skill.principle)}</div>
        </div>

        ${renderSkillExample(skill.example)}

        <div class="practice-section">
            <div class="practice-workspace">
                <div class="practice-workspace-head">
                    <div>
                        <div class="practice-workspace-kicker">${esc(practice.kicker || 'Practice')}</div>
                        <div class="practice-workspace-title">${esc(practice.title)}</div>
                    </div>
                    <div class="practice-workspace-note">${esc(practice.note)}</div>
                </div>

                <div class="practice-workspace-body">
                    <div class="practice-language">
                        <div class="practice-language-label">Useful phrases</div>
                        <div class="phrase-chips">
                            ${phrases.map(function (phrase) {
            return '<div class="phrase-chip">' + esc(phrase) + '</div>';
        }).join('')}
                        </div>
                    </div>

                    <div class="practice-tabs">
                        ${tabs.map(function (tab, index) {
            return `
                                <div class="practice-tab${index === 0 ? ' active' : ''}" onclick="switchTab(this,'${esc(tab.id)}')">
                                    ${esc(tab.label)}
                                </div>
                            `;
        }).join('')}
                    </div>

                    ${tabs.map(function (tab, index) {
            return `
                            <div class="practice-pane${index === 0 ? ' active' : ''}" id="${esc(tab.id)}">
                                <div class="practice-card">
                                    <div class="practice-prompt">${esc(tab.prompt)}</div>
                                    <div class="practice-task">${tab.task || ''}</div>
                                </div>
                            </div>
                        `;
        }).join('')}

                    <div class="practice-check">
                        <div class="practice-check-label">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Skill check
                        </div>
                        <ul class="practice-check-list">
                            ${checks.map(function (item) {
            return '<li><span>' + item + '</span></li>';
        }).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="quick-recap">
            <div class="recap-icon">${icon('target', 14, 14)}</div>
            <div>
                <div class="recap-label">Quick Recap</div>
                <div class="recap-text">${esc((skill.recap || {}).text)}</div>
                <div class="recap-phrase">${esc((skill.recap || {}).phrase)}</div>
            </div>
        </div>
    `);
    }

    function renderSkillExample(example) {
        if (!example) return '';

        return `
        <div class="full-example">
            <div class="full-example-toggle" onclick="toggleFullExample(this)">
                <div>
                    <div class="toggle-label">${esc(example.title)}</div>
                    <div class="toggle-sub">${esc(example.subtitle)}</div>
                </div>
                <div class="toggle-chevron">
                    ${icon('chevron-down', 14, 14)}
                </div>
            </div>

            <div class="full-example-body">
                <div class="client-label">${esc(example.promptLabel)}</div>
                <div class="client-quote">${esc(example.prompt)}</div>

                <div class="client-label mt-10">${esc(example.responseLabel)}</div>
                <div class="response-text">${esc(example.response)}</div>
            </div>
        </div>
    `;
    }

    function renderPutItTogether(pageNumber) {
        const data = MODULE.putItTogether || {};
        const sequence = Array.isArray(data.sequence) ? data.sequence : [];
        const rehearsal = data.rehearsal || {};
        const briefs = Array.isArray(rehearsal.briefs) ? rehearsal.briefs : [];
        const tasks = Array.isArray(rehearsal.tasks) ? rehearsal.tasks : [];
        const examples = Array.isArray(data.examples) ? data.examples : [];

        if (!data.title) return renderMissingPage(pageNumber);

        return renderPage(pageNumber, `
        <div class="page-eyebrow">${esc(data.eyebrow)}</div>
        <h1 class="page-title">${esc(data.title)}</h1>
        <p class="page-subtitle">${esc(data.subtitle)}</p>

        <section class="integration-framework-strip">
            <span class="integration-framework-label">${esc(data.sequenceLabel || 'Framework')}</span>

            ${sequence.map(function (step, index) {
            const isLast = index === sequence.length - 1;

            return `
                    <span class="integration-framework-pill">${esc(step.label)}</span>
                    ${!isLast ? '<span class="integration-framework-arrow">→</span>' : ''}
                `;
        }).join('')}
        </section>

        <div class="rehearsal-workspace">
            <div class="rehearsal-head">
                <div class="rehearsal-kicker">${esc(rehearsal.kicker)}</div>
                <div class="rehearsal-title">${esc(rehearsal.title)}</div>
                <div class="rehearsal-note">${esc(rehearsal.note)}</div>
            </div>

            <div class="rehearsal-body">
                <div class="rehearsal-grid">
                    <div class="rehearsal-panel">
                        <div class="rehearsal-panel-label">${esc(rehearsal.briefLabel)}</div>

                        <div class="rehearsal-briefs">
                            ${briefs.map(function (brief) {
            return `
                                    <div class="rehearsal-brief" onclick="selectRehearsalBrief(this)">
                                        <div class="rehearsal-brief-title">${esc(brief.title)}</div>
                                        <div class="rehearsal-brief-text">${esc(brief.text)}</div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>

                    <div class="rehearsal-panel">
                        <div class="rehearsal-panel-label">${esc(rehearsal.taskLabel)}</div>

                        <ul class="rehearsal-task-list">
                            ${tasks.map(function (task) {
            if (typeof task === 'string') {
                return '<li><span class="rehearsal-task-content">' + task + '</span></li>';
            }

            return `
                                    <li>
                                        <span class="rehearsal-task-content">
                                            <span class="rehearsal-task-main">
                                                <strong>${esc(task.label || '')}</strong> ${esc(task.text || '')}
                                            </span>
                                            <span class="rehearsal-task-example">${esc(task.example || '')}</span>
                                        </span>
                                    </li>
                                `;
        }).join('')}
                        </ul>
                    </div>
                </div>

                <div class="rehearsal-challenge">
                    <div class="rehearsal-challenge-label">${esc(rehearsal.challengeLabel)}</div>
                    <div class="rehearsal-challenge-text">${esc(rehearsal.challenge)}</div>
                </div>
            </div>
        </div>

        ${examples.map(renderIntegrationExample).join('')}

        ${data.optionalQuestion ? `
            <div class="optional-q mt-16">
                <div class="optional-q-label">${esc(data.optionalQuestionLabel || 'Optional — quick question')}</div>
                <div class="optional-q-text">${esc(data.optionalQuestion)}</div>
            </div>
        ` : ''}
    `);
    }

    function renderIntegrationExample(example, index) {
        const turns = Array.isArray(example.turns) ? example.turns : [];

        return `
        <div class="full-example ${index === 0 ? 'mt-20' : 'mt-12'}">
            <div class="full-example-toggle" onclick="toggleFullExample(this)">
                <div>
                    <div class="toggle-label">${esc(example.title)}</div>
                    <div class="toggle-sub">${esc(example.subtitle)}</div>
                </div>
                <div class="toggle-chevron">
                    ${icon('chevron-down', 14, 14)}
                </div>
            </div>

            <div class="full-example-body">
                ${turns.map(function (turn, turnIndex) {
            const spacing = turnIndex > 0 ? ' mt-12' : '';
            const label = turn.label
                ? '<div class="client-label' + spacing + '">' + esc(turn.label) + '</div>'
                : '';

            const body = turn.type === 'quote'
                ? '<div class="client-quote">' + esc(turn.text) + '</div>'
                : '<div class="response-text">' + renderExampleText(turn.text) + '</div>';

            return label + body;
        }).join('')}
            </div>
        </div>
    `;
    }

    function renderExampleText(text) {
        if (Array.isArray(text)) {
            return text.map(function (paragraph) {
                return esc(paragraph);
            }).join('<br><br>');
        }

        return esc(text);
    }

    function renderCompletionPage(pageNumber) {
        const data = MODULE.completion || {};
        const canDo = Array.isArray(data.canDo) ? data.canDo : [];
        const framework = Array.isArray(data.framework) ? data.framework : [];
        const reflection = Array.isArray(data.reflection) ? data.reflection : [];
        const suggestedNextRaw = Array.isArray(data.suggestedNext) ? data.suggestedNext : [];
        const suggestedNext = suggestedNextRaw.map(resolveSuggestedNextModule);
        const actions = data.actions || {};

        if (!data.title) return renderMissingPage(pageNumber);

        return renderPage(pageNumber, `
            <div class="completion-hero">
                <div class="completion-badge">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                        <path d="M8 18l6 6 14-14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </div>

                <h1 class="completion-title">${data.title}</h1>
                <p class="completion-sub">${esc(data.subtitle)}</p>
            </div>

            <div class="win-message">${esc(data.winMessage)}</div>

            <div class="two-col">
              <div class="card completion-can-do-card">
                <div class="section-label mb-8">${esc(data.canDoTitle)}</div>

                    <div class="can-do-list">
                        ${canDo.map(function (item) {
            return `
                                <div class="can-do-item">
                                    <div class="can-do-check">${icon('check-lg', 11, 11)}</div>
                                    ${esc(item)}
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>

                <div>
                    <div class="completion-framework">
                        <div class="completion-framework-label">${esc(data.frameworkTitle)}</div>

                        <div class="completion-framework-list">
                            ${framework.map(function (item, index) {
            return `
                                    <div class="completion-framework-step">
                                        <span class="completion-framework-dot">${index + 1}</span>
                                        <span class="completion-framework-name">${esc(item)}</span>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <section class="completion-apply-card">
                <div class="completion-apply-copy">
                    <div class="completion-apply-kicker">Do this next</div>

                    <h2 class="completion-apply-title">
                        Try it on something real
                    </h2>

                    <p class="completion-apply-text">
                        ${esc(actions.note || 'Choose one real work moment and prepare what you need to say.')}
                    </p>
                </div>

                <div class="completion-apply-actions">
                    <button class="btn-teal" onclick="goToPage(${Number(actions.nextPage) || 14})">
                        ${esc(actions.nextLabel || 'Prep a Real Moment')}
                        ${icon('arrow-right-bonus', 15, 15)}
                    </button>

                    <button class="completion-apply-secondary" onclick="jumpToQuickReference()">
                        ${icon('doc-plus', 13, 13)}
                        ${esc(actions.quickReferenceLabel || 'Quick Reference')}
                    </button>
                </div>
            </section>

            <div class="card mt-14">
                <div class="section-label mb-8">${esc(data.reflectionTitle)}</div>

                ${reflection.map(function (item, index) {
            return `
                        <div class="reflection-q${index === reflection.length - 1 ? ' last' : ''}">
                            ${esc(item)}
                        </div>
                    `;
        }).join('')}
            </div>

            <div class="mt-28">
                <div class="suggested-next-section">
                    <div class="section-label suggested-next-label">${esc(data.suggestedNextTitle)}</div>

                    <div class="next-modules">
                        ${suggestedNext.map(function (item) {
            return `
                                <div class="next-module-card">
                                    <div class="next-module-icon">
                                        ${renderNextModuleIcon(item.icon)}
                                    </div>

                                    <div class="next-module-content">
                                        <div class="next-module-kicker">${esc(item.kicker)}</div>
                                        <div class="next-module-title">${esc(item.title)}</div>
                                        <div class="next-module-desc">${renderSuggestedNextDescription(item)}</div>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `);
    }

    function resolveSuggestedNextModule(item) {
        const override = item && typeof item === 'object' ? item : {};
        const id = typeof item === 'string'
            ? item
            : override.id || override.key || override.icon;

        const base = SUGGESTED_NEXT_MODULES[id] || {};

        return Object.assign({
            id: id || '',
            icon: id || 'target',
            kicker: 'Next Path',
            title: 'Suggested Module',
            reasonLabel: 'Best for:',
            reason: ''
        }, base, override);
    }

    function renderSuggestedNextDescription(item) {
        if (item.desc) return item.desc;

        const label = item.reasonLabel || 'Best for:';
        const text = item.reason || '';

        if (!text) return '';

        return '<strong>' + esc(label) + '</strong> ' + esc(text);
    }

    function renderNextModuleIcon(name) {
        return icon('next-' + (name || 'target'), 24, 24);
    }

    /* ==========================================================================
       INTEGRATE / PREP / REFERENCE RENDERERS
       ========================================================================== */
    function renderPrepMomentPage(pageNumber) {
        const data = MODULE.prepMoment || {};
        const events = Array.isArray(data.events) ? data.events : [];
        const selectedIndex = Number.isInteger(data.defaultEvent) ? data.defaultEvent : 0;
        const selectedEvent = events[selectedIndex] || events[0] || {};
        const labels = data.labels || {};
        const supportLinks = Array.isArray(data.supportLinks) ? data.supportLinks : [];

        if (!data.title) return renderMissingPage(pageNumber);

        return renderPage(pageNumber, `
        <div class="page-eyebrow teal">${esc(data.eyebrow || 'Prep')}</div>
        <h1 class="page-title">${esc(data.title)}</h1>
        <p class="page-subtitle">${esc(data.subtitle)}</p>

        <section class="prep-compact mt-8">
            <div class="prep-choice-head">
                ${esc(data.eventQuestion || 'What are you preparing for?')}
            </div>

            <div class="prep-choice-grid">
                ${events.map(function (event, index) {
            return `
                        <button class="prep-choice${index === selectedIndex ? ' active' : ''}" onclick="selectPrepEvent(this, ${index})">
                            ${esc(event.label)}
                        </button>
                    `;
        }).join('')}
            </div>

            <section class="prep-result" id="prepRepPanel">
                ${renderPrepRepContent(selectedEvent, data)}
            </section>
        </section>

        <section class="prep-support-strip mt-16">
            <div>
                <div class="prep-support-title">${esc(labels.links || 'Need support?')}</div>
                <div class="prep-support-text">
                    Use these only when they help your real moment. Do not browse before running the rep.
                </div>
            </div>

            <div class="prep-support-actions">
                ${supportLinks.map(function (link) {
            return `
                        <button class="secondary-btn" onclick="goToPage(${Number(link.page) || 1})">
                            ${esc(link.label)}
                        </button>
                    `;
        }).join('')}
            </div>
        </section>
    `);
    }

    function renderPrepRepContent(event, data) {
        const labels = data.labels || {};
        const structure = Array.isArray(data.structure) ? data.structure : [];
        const selfCheck = Array.isArray(data.selfCheck) ? data.selfCheck : [];
        const silentFallback = data.silentFallback || {};
        const fallbackBullets = Array.isArray(silentFallback.bullets) ? silentFallback.bullets : [];

        return `
            <div class="prep-result-head">
                <div>
                    <div class="prep-result-kicker">
                        ${esc(labels.run || 'Run it')}
                    </div>
                    <h2 class="prep-result-title">${esc(event.title || '')}</h2>
                </div>

                <div class="prep-result-timer">
                    <strong>${esc(labels.timer || '60 seconds')}</strong>
                    <span>Speak it once.</span>
                </div>
            </div>

            <div class="prep-result-grid">
                <div class="prep-result-card">
                    <div class="prep-result-label">${esc(labels.situation || 'Situation')}</div>
                    <p>${esc(event.situation || '')}</p>
                </div>

                <div class="prep-result-card">
                    <div class="prep-result-label">${esc(labels.task || 'Your task')}</div>
                    <p>${esc(event.task || '')}</p>
                </div>

                <div class="prep-result-card starter">
                    <div class="prep-result-label">${esc(labels.starter || 'Starter phrase')}</div>
                    <p>${esc(event.starter || '')}</p>
                </div>

                <div class="prep-result-card structure">
                    <div class="prep-result-label">${esc(labels.structure || 'Use this structure')}</div>
                    <ol class="prep-result-structure">
                        ${structure.map(function (item) {
            return `<li>${esc(item)}</li>`;
        }).join('')}
                    </ol>
                </div>

                <div class="prep-result-card stress">
                    <div class="prep-result-label">${esc(labels.stressTest || 'Stress test')}</div>
                    <p>${esc(event.stressTest || '')}</p>
                </div>

                <div class="prep-result-card silent">
                    <div class="prep-result-label">${esc(labels.silentFallback || 'Can’t speak right now?')}</div>
                    <p>${esc(silentFallback.text || 'Write three bullets instead.')}</p>
                    <div class="prep-result-bullets">
                        ${fallbackBullets.map(function (bullet) {
            return `<span>${esc(bullet)}</span>`;
        }).join('')}
                    </div>
                </div>
            </div>

            <div class="prep-result-check">
                <div class="prep-result-label">${esc(labels.selfCheck || 'Quick self-check')}</div>
                <ul>
                    ${selfCheck.map(function (item) {
            return `<li>${esc(item)}</li>`;
        }).join('')}
                </ul>
            </div>
        `;
    }

    function renderGetTheWordsPage(pageNumber) {
        const data = MODULE.getTheWords || {};
        const groups = Array.isArray(data.groups) ? data.groups : [];

        if (!data.title) return renderMissingPage(pageNumber);

        return renderPage(pageNumber, `
        <div class="page-eyebrow">${esc(data.eyebrow)}</div>
        <h1 class="page-title">${esc(data.title)}</h1>
        <p class="page-subtitle">${esc(data.subtitle)}</p>

        <div class="lang-accordion mt-8">
            ${groups.map(function (group) {
            const phrases = Array.isArray(group.phrases) ? group.phrases : [];

            return `
                    <div class="lang-group${group.open ? ' open' : ''}">
                        <div class="lang-group-header" onclick="toggleLangGroup(this)">
                            <div>
                                <span class="lang-group-title">${esc(group.title)}</span>
                                <span class="lang-group-count">${phrases.length} phrases</span>
                            </div>

                            <svg class="lang-chevron" width="16" height="16" style="color:#6B7280" aria-hidden="true">
                                <use href="#icon-chevron-down"></use>
                            </svg>
                        </div>

                        <div class="lang-group-body">
                            <div class="lang-phrase-list">
                                ${phrases.map(function (phrase) {
                return '<div class="lang-phrase">' + esc(phrase) + '</div>';
            }).join('')}
                            </div>
                        </div>
                    </div>
                `;
        }).join('')}
        </div>

        <div class="optional-q mt-16">
            <div class="optional-q-label">${esc(data.optionalQuestionLabel)}</div>
            <div class="optional-q-text">${esc(data.optionalQuestion)}</div>
        </div>
    `);
    }

    function renderCompareStrongVersionPage(pageNumber) {
        const data = MODULE.compareStrongVersion || {};
        const markers = Array.isArray(data.markers) ? data.markers : [];
        const examples = Array.isArray(data.examples) ? data.examples : [];

        if (!data.title) return renderMissingPage(pageNumber);

        return renderPage(pageNumber, `
        <div class="page-eyebrow">${esc(data.eyebrow)}</div>
        <h1 class="page-title">${esc(data.title)}</h1>
        <p class="page-subtitle">${esc(data.subtitle)}</p>

        <div class="card mt-8">
            <div class="section-label mb-8">${esc(data.markersTitle)}</div>

            <ul class="build-list">
                ${markers.map(function (item) {
            return `
                        <li>
                            <div class="build-dot">${icon('check', 10, 10)}</div>
                            ${esc(item)}
                        </li>
                    `;
        }).join('')}
            </ul>
        </div>

        <div class="mt-20">
            ${examples.map(function (example, index) {
            return `
                    <div class="full-example ${index === 0 ? '' : 'mt-12'}">
                        <div class="full-example-toggle" onclick="toggleFullExample(this)">
                            <div>
                                <div class="toggle-label">${esc(example.title)}</div>
                                <div class="toggle-sub">${esc(example.subtitle)}</div>
                            </div>

                            <div class="toggle-chevron">
                                ${icon('chevron-down', 14, 14)}
                            </div>
                        </div>

                        <div class="full-example-body">
                            <div class="client-label">${esc(example.weakLabel)}</div>
                            <div class="client-quote">${esc(example.weak)}</div>

                            <div class="client-label mt-10">${esc(example.strongLabel)}</div>
                            <div class="response-text">${esc(example.strong)}</div>

                            <div class="guidance-note mt-14">
                                <div class="guidance-note-label">${esc(example.whyLabel)}</div>
                                <div class="guidance-note-text">${esc(example.why)}</div>
                            </div>
                        </div>
                    </div>
                `;
        }).join('')}
        </div>

        <div class="card mt-20">
            <div class="section-label mb-8">${esc(data.finalNoteTitle)}</div>
            <p style="font-size:14px;color:var(--muted);line-height:1.65">
                ${esc(data.finalNote)}
            </p>
        </div>
    `);
    }

    /* ==========================================================================
       JUMP-ONLY AND FALLBACK RENDERERS
       ========================================================================== */

    function renderQuickReferencePage() {
        const data = MODULE.quickReference || {};
        const sections = Array.isArray(data.sections) ? data.sections : [];

        return `
        <div class="page quick-ref-page" id="quick-reference">
            <div class="page-eyebrow">${esc(data.eyebrow || 'Quick Reference')}</div>
            <h1 class="page-title">${esc(data.title || MODULE.title + ' Quick Reference')}</h1>
            <p class="page-subtitle">${esc(data.subtitle || '')}</p>

            ${sections.map(renderQuickReferenceSection).join('')}

            <div class="quick-ref-actions">
                <button id="qr-print-btn" class="btn-teal" onclick="window.print()">
                    ${icon('print', 15, 15)}
                    ${esc(data.printLabel || 'Print / Save as PDF')}
                </button>
            </div>
        </div>
    `;
    }

    function renderQuickReferenceSection(section) {
        const type = section.type || 'cards';

        if (type === 'framework') {
            return renderQuickReferenceFramework(section);
        }

        if (type === 'phrases') {
            return renderQuickReferencePhrases(section);
        }

        if (type === 'pills') {
            return renderQuickReferencePills(section);
        }

        return renderQuickReferenceCards(section);
    }

    function renderQuickReferenceFramework(section) {
        const items = Array.isArray(section.items) ? section.items : [];

        return `
        <div class="quick-ref-section">
            <div class="quick-ref-heading">${esc(section.heading)}</div>

            <div class="quick-ref-framework">
                ${items.map(function (item) {
            return `
                        <div class="quick-ref-step">
                            <div class="quick-ref-step-num">${esc(item.num)}</div>
                            <div class="quick-ref-step-name">${esc(item.name)}</div>
                            <div class="quick-ref-step-phrase">${esc(item.phrase)}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        </div>
    `;
    }

    function renderQuickReferencePhrases(section) {
        const items = Array.isArray(section.items) ? section.items : [];

        return `
        <div class="quick-ref-section">
            <div class="quick-ref-heading">${esc(section.heading)}</div>

            <div class="quick-ref-card">
                <div class="quick-ref-phrase-grid">
                    ${items.map(function (item) {
            return `
                            <div class="quick-ref-phrase">
                                <div class="quick-ref-phrase-label">${esc(item.label)}</div>
                                <div class="quick-ref-phrase-text">${esc(item.text)}</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        </div>
    `;
    }

    function renderQuickReferenceCards(section) {
        const items = Array.isArray(section.items) ? section.items : [];

        return `
        <div class="quick-ref-section">
            <div class="quick-ref-heading">${esc(section.heading)}</div>

            <div class="quick-ref-signal-grid">
                ${items.map(function (item) {
            return `
                        <div class="quick-ref-signal">
                            <div class="quick-ref-signal-title">${esc(item.title)}</div>
                            <div class="quick-ref-signal-text">${esc(item.text)}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        </div>
    `;
    }

    function renderQuickReferencePills(section) {
        const items = Array.isArray(section.items) ? section.items : [];

        return `
        <div class="quick-ref-section">
            <div class="quick-ref-heading">${esc(section.heading)}</div>

            <div class="quick-ref-card">
                <div class="quick-ref-use-list">
                    ${items.map(function (item) {
            return `<div class="quick-ref-use-pill">${esc(item)}</div>`;
        }).join('')}
                </div>
            </div>
        </div>
    `;
    }

    function renderMissingPage(pageNumber, reason) {
        const title = PAGE_TITLES[pageNumber] || 'Page ' + pageNumber;

        return renderPage(pageNumber, `
        <div class="page-eyebrow amber">Missing Content</div>
        <h1 class="page-title">${esc(title)}</h1>
        <p class="page-subtitle">
            This page has a route, but the module data or renderer is missing.
        </p>

        <div class="card">
            <div class="section-label mb-8">Developer note</div>
            <p style="font-size:14px;color:var(--muted);line-height:1.65">
                ${esc(reason || 'Check module-data.js and the page renderer for this page.')}
            </p>
        </div>
    `);
    }

    /* ==========================================================================
       MODULE ASSEMBLY
       ========================================================================== */

    function renderModule() {
        let pages = '';

        pages += renderLanding(1);
        pages += renderOverview(2);
        pages += renderHowThisWorks(3);
        pages += renderFramework(4);
        pages += renderControlMap(5);

        const skills = Array.isArray(MODULE.skills) ? MODULE.skills : [];
        const renderedSkillPages = {};

        skills.forEach(function (skill) {
            const page = Number(skill.page);
            if (page) renderedSkillPages[page] = skill;
        });

        for (let i = 6; i <= TOTAL; i++) {
            if (renderedSkillPages[i]) {
                pages += renderSkillPage(renderedSkillPages[i]);
            } else if (i === Number((MODULE.putItTogether || {}).page || 12)) {
                pages += renderPutItTogether(i);
            } else if (i === Number((MODULE.completion || {}).page || 13)) {
                pages += renderCompletionPage(i);
            } else if (i === Number((MODULE.prepMoment || {}).page || 14)) {
                pages += renderPrepMomentPage(i);
            } else if (i === Number((MODULE.getTheWords || {}).page || 15)) {
                pages += renderGetTheWordsPage(i);
            } else if (i === Number((MODULE.compareStrongVersion || {}).page || 16)) {
                pages += renderCompareStrongVersionPage(i);
            } else {
                pages += renderMissingPage(i, 'No renderer matched this page number.');
            }
        }

        pages += renderQuickReferencePage();

        root.innerHTML = `
            ${renderIconLibrary()}
            ${renderTopBar()}
            <main class="page-content">
                ${pages}
            </main>
            ${renderJumpPanel()}
            ${renderBottomBar()}
        `;
    }

    /* ==========================================================================
   BEHAVIOUR
   ========================================================================== */

    function getSec(p) {
        let sec = 0;

        for (let i = 0; i < SECTION_STARTS.length; i++) {
            if (p >= SECTION_STARTS[i]) sec = i;
        }

        return Math.min(sec, Math.max(0, SECTIONS.length - 1));
    }

    function updateHeader(p) {
        const s = getSec(p);

        for (let i = 0; i < SECTIONS.length; i++) {
            const step = document.getElementById('sec-' + i);
            const conn = document.getElementById('conn-' + i);

            if (step) step.classList.remove('active', 'done');
            if (conn) conn.classList.remove('done');

            if (i < s) {
                if (step) step.classList.add('done');
                if (conn) conn.classList.add('done');
            } else if (i === s) {
                if (step) step.classList.add('active');
            }
        }
    }

    function updateBar(p) {
        const back = document.getElementById('btnBack');
        const cont = document.getElementById('btnContinue');
        const ind = document.getElementById('pageIndicator');
        const bar = document.getElementById('bottomBar');

        if (!back || !cont || !ind || !bar) return;

        if (p === 1 && !quickRefActive) {
            bar.classList.add('hidden');
        } else {
            bar.classList.remove('hidden');
            back.disabled = false;
        }

        if (quickRefActive) {
            ind.innerHTML =
                '<span class="page-count-desktop">Quick Reference</span>' +
                '<span class="page-count-mobile">Quick Ref</span>';
        } else {
            const title = PAGE_TITLES[p] ? ' · ' + PAGE_TITLES[p] : '';

            ind.innerHTML =
                '<span class="page-count-desktop">Page ' + p + ' of ' + TOTAL + '</span>' +
                '<span class="page-count-mobile">' + p + '/' + TOTAL + '</span>' +
                '<span class="page-title-desktop">' + esc(title) + '</span>';
        }

        if (quickRefActive || p === TOTAL) {
            cont.style.display = 'none';
        } else {
            cont.style.display = 'inline-flex';

            const lbl = CONTINUE_LABELS[p] || 'Continue';

            cont.innerHTML = esc(lbl) +
                ' <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }

        document.querySelectorAll('.jump-link').forEach(function (el) {
            el.classList.remove('current');
        });

        if (quickRefActive) {
            const qrLink = document.getElementById('qr-jump-link');
            if (qrLink) qrLink.classList.add('current');
        } else {
            document.querySelectorAll('.jump-link').forEach(function (el) {
                const fn = el.getAttribute('onclick') || '';
                const match = fn.match(/jumpTo\((\d+)\)/);

                if (match && Number(match[1]) === Number(p)) {
                    el.classList.add('current');
                }
            });
        }
    }

    function goToPage(n) {
        n = Number(n);

        if (!Number.isInteger(n) || n < 1 || n > TOTAL) return;

        const target = document.getElementById('page-' + n);
        if (!target) return;

        if (quickRefActive) {
            const qr = document.getElementById('quick-reference');
            if (qr) qr.classList.remove('active');
            quickRefActive = false;
        }

        const current = document.querySelector('.page.active');
        if (current) current.classList.remove('active');

        cur = n;
        target.classList.add('active');

        updateHeader(cur);
        updateBar(cur);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function jumpToQuickReference() {
        closeJump();

        if (quickRefActive) return;

        const qr = document.getElementById('quick-reference');
        if (!qr) return;

        const current = document.querySelector('.page.active');
        if (current) current.classList.remove('active');

        quickRefActive = true;
        qr.classList.add('active');

        updateHeader(QUICK_REF_HEADER_PAGE);
        updateBar(cur);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleBack() {
        if (quickRefActive) {
            const qr = document.getElementById('quick-reference');
            const current = document.getElementById('page-' + cur);

            if (qr) qr.classList.remove('active');
            quickRefActive = false;

            if (current) current.classList.add('active');

            updateHeader(cur);
            updateBar(cur);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (cur > 1) {
            goToPage(cur - 1);
        }
    }

    function handleContinue() {
        if (cur < TOTAL) goToPage(cur + 1);
    }

    function toggleJump() {
        const panel = document.getElementById('jumpPanel');
        const overlay = document.getElementById('jumpOverlay');
        const btn = document.getElementById('btnJump');

        if (!panel || !overlay || !btn) return;

        const isOpen = panel.classList.contains('open');

        if (isOpen) {
            panel.classList.remove('open');
            overlay.classList.remove('open');
            btn.classList.remove('open');
        } else {
            panel.classList.add('open');
            overlay.classList.add('open');
            btn.classList.add('open');
        }
    }

    function closeJump() {
        const panel = document.getElementById('jumpPanel');
        const overlay = document.getElementById('jumpOverlay');
        const btn = document.getElementById('btnJump');

        if (panel) panel.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        if (btn) btn.classList.remove('open');
    }

    function jumpTo(n) {
        closeJump();
        goToPage(n);
    }

    function selectControlMapPattern(button, index) {
        const data = MODULE.controlMap || {};
        const items = Array.isArray(data.items) ? data.items : [];
        const item = items[index];
        const panel = document.getElementById('controlMapDetailPanel');

        if (!item || !panel) return;

        document.querySelectorAll('.control-map-choice').forEach(function (choice) {
            choice.classList.remove('active');
        });

        button.classList.add('active');
        panel.innerHTML = renderControlMapDetail(item);
    }

    function switchTab(tab, paneId) {
        const row = tab.closest('.practice-tabs');
        const sec = tab.closest('.practice-section');
        const pane = document.getElementById(paneId);

        if (!row || !sec || !pane) return;

        row.querySelectorAll('.practice-tab').forEach(function (t) {
            t.classList.remove('active');
        });

        tab.classList.add('active');

        sec.querySelectorAll('.practice-pane').forEach(function (p) {
            p.classList.remove('active');
        });

        pane.classList.add('active');
    }

    function toggleLangGroup(header) {
        const group = header.closest('.lang-group');
        if (group) group.classList.toggle('open');
    }

    function toggleFullExample(toggle) {
        toggle.classList.toggle('open');
    }

    function selectPrepEvent(button, index) {
        const data = MODULE.prepMoment || {};
        const events = Array.isArray(data.events) ? data.events : [];
        const event = events[index];
        const panel = document.getElementById('prepRepPanel');

        if (!event || !panel) return;

        document.querySelectorAll('.prep-choice').forEach(function (item) {
            item.classList.remove('active');
        });

        button.classList.add('active');
        panel.innerHTML = renderPrepRepContent(event, data);
    }

    function selectRehearsalBrief(card) {
        const group = card.closest('.rehearsal-briefs') || document;

        group.querySelectorAll('.rehearsal-brief').forEach(function (b) {
            b.classList.remove('selected');
        });

        card.classList.add('selected');
    }

    function initSelectableChips() {
        document.querySelectorAll('.phrase-chip, .lang-phrase').forEach(function (chip) {
            chip.addEventListener('click', function () {
                chip.classList.toggle('selected');
            });
        });
    }

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeJump();
        });
    }

    /* ==========================================================================
       INIT
       ========================================================================== */

    function initAptumModule() {
        renderModule();

        window.goToPage = goToPage;
        window.jumpToQuickReference = jumpToQuickReference;
        window.handleBack = handleBack;
        window.handleContinue = handleContinue;
        window.toggleJump = toggleJump;
        window.closeJump = closeJump;
        window.jumpTo = jumpTo;
        window.selectControlMapPattern = selectControlMapPattern;
        window.switchTab = switchTab;
        window.toggleLangGroup = toggleLangGroup;
        window.toggleFullExample = toggleFullExample;
        window.selectPrepEvent = selectPrepEvent;
        window.selectRehearsalBrief = selectRehearsalBrief;

        initSelectableChips();
        initKeyboardShortcuts();
        updateHeader(cur);
        updateBar(cur);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAptumModule);
    } else {
        initAptumModule();
    }
})();
