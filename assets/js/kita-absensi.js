document.addEventListener('alpine:init', () => {

    // ─── HELPER FUNCTIONS ──────────────────────────────────────────────

    function formatDate(dateStr) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const date = new Date(dateStr);
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function addMinutes(timeStr, minutes) {
        const [h, m] = timeStr.split(':').map(Number);
        const total = h * 60 + m + minutes;
        const newH = String(Math.floor(total / 60) % 24).padStart(2, '0');
        const newM = String(total % 60).padStart(2, '0');
        return `${newH}:${newM}`;
    }

    function generateHistory() {
        const history = [];

        // Periode 1: 20 Mei – 8 Juni, Shift Sore di Raja Kepiting (16:00 - 00:00)
        let current = new Date(2026, 4, 20);
        const end1 = new Date(2026, 5, 8);
        while (current <= end1) {
            const dateStr = current.toISOString().split('T')[0];
            const lateMin = Math.floor(Math.random() * 45);
            let status = 'on-time';
            if (lateMin > 15 && lateMin <= 30) status = 'late-5-15';
            else if (lateMin > 30) status = 'late-30-60';
            history.push({
                date: dateStr,
                date_formatted: formatDate(dateStr),
                shift: 'Sore',
                check_in: addMinutes('16:00', lateMin),
                check_out: addMinutes('00:00', lateMin),
                status: status
            });
            current.setDate(current.getDate() + 1);
        }

        // Periode 2: 10 Juni – 27 Juni, Shift Sore di My Fried Chicken (15:00 - 23:00)
        current = new Date(2026, 5, 10);
        const end2 = new Date(2026, 5, 27);
        while (current <= end2) {
            const dateStr = current.toISOString().split('T')[0];
            const lateMin = Math.floor(Math.random() * 45);
            let status = 'on-time';
            if (lateMin > 15 && lateMin <= 30) status = 'late-5-15';
            else if (lateMin > 30) status = 'late-30-60';
            history.push({
                date: dateStr,
                date_formatted: formatDate(dateStr),
                shift: 'Sore',
                check_in: addMinutes('15:00', lateMin),
                check_out: addMinutes('23:00', lateMin),
                status: status
            });
            current.setDate(current.getDate() + 1);
        }

        history.sort((a, b) => new Date(a.date) - new Date(b.date));
        return history;
    }

    // ─── DATA DUMMY ──────────────────────────────────────────────────────

    const dummyEmployee = {
        id: 1,
        nama: 'Deuwi Satriya Irawan',
        outlet_id: 1,
        shift_id: 2,
        total_absen: 38,
        status: 'on-time'
    };

    // ─── COMPONENT: PRESENCE APP ──────────────────────────────────────

    Alpine.data('presenceApp', () => ({
        outlets: [
            { id: 1, name: 'My Fried Chicken' },
            { id: 2, name: 'Raja Kepiting' },
            { id: 3, name: 'Ayam Bebek Ganza' }
        ],
        shiftsMap: {
            1: [
                { id: 1, name: 'Shift Pagi', start: '07:00', end: '15:00', label: 'Pagi' },
                { id: 2, name: 'Shift Sore', start: '15:00', end: '23:00', label: 'Sore' }
            ],
            2: [
                { id: 1, name: 'Shift Pagi', start: '08:00', end: '16:00', label: 'Pagi' },
                { id: 2, name: 'Shift Sore', start: '16:00', end: '00:00', label: 'Sore' },
                { id: 3, name: 'Shift Malam', start: '00:00', end: '08:00', label: 'Malam' }
            ],
            3: [
                { id: 1, name: 'Shift Pagi', start: '08:00', end: '16:00', label: 'Pagi' },
                { id: 2, name: 'Shift Sore', start: '16:00', end: '00:00', label: 'Sore' },
                { id: 3, name: 'Shift Malam', start: '00:00', end: '08:00', label: 'Malam' }
            ]
        },
        selectedOutletId: null,
        selectedShiftId: null,
        presenceType: 'masuk',
        name: 'Deuwi Satriya Irawan',
        isSelf: true,
        isSubmitting: false,

        modalIcon: '✅',
        modalTitle: 'Presence Result',
        modalMessage: '',
        modalLate: false,
        modalLateMessage: '',
        modalPhoto: false,
        modalPhotoPreview: null,

        currentTime: '--:--:--',
        clockInterval: null,
        photoFile: null,
        photoPreview: null,

        get shifts() {
            if (!this.selectedOutletId) return [];
            return this.shiftsMap[this.selectedOutletId] || [];
        },

        get isFormValid() {
            return this.selectedOutletId && this.selectedShiftId !== null && this.name.trim().length > 0;
        },

        initClock() {
            this.updateClock();
            if (this.clockInterval) clearInterval(this.clockInterval);
            this.clockInterval = setInterval(() => this.updateClock(), 1000);
        },

        updateClock() {
            const now = new Date();
            this.currentTime = String(now.getHours()).padStart(2, '0') + ':' +
                               String(now.getMinutes()).padStart(2, '0') + ':' +
                               String(now.getSeconds()).padStart(2, '0');
        },

        onOutletChange() {
            this.selectedShiftId = null;
        },

        parseTimeToMinutes(timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        },

        handlePhoto(event) {
            const file = event.target.files[0];
            if (!file) return;
            this.photoFile = file;
            const reader = new FileReader();
            reader.onload = (e) => { this.photoPreview = e.target.result; };
            reader.readAsDataURL(file);
            event.target.value = '';
        },

        showPresenceModal(icon, title, message, late = false, lateMsg = '', photo = null) {
            this.modalIcon = icon;
            this.modalTitle = title;
            this.modalMessage = message;
            this.modalLate = late;
            this.modalLateMessage = lateMsg;
            this.modalPhoto = photo !== null;
            this.modalPhotoPreview = photo;
            const el = document.getElementById('presenceModal');
            if (el) new bootstrap.Modal(el).show();
        },

        showToast(message) {
            const el = document.getElementById('toastModal');
            if (el) {
                const msgEl = el.querySelector('.toast-message');
                if (msgEl) msgEl.textContent = message;
                new bootstrap.Modal(el).show();
            }
        },

        resetForm() {
            this.photoFile = null;
            this.photoPreview = null;
            if (this.$refs?.photoInput) this.$refs.photoInput.value = '';
            this.selectedShiftId = null;
            this.presenceType = 'masuk';
            this.name = this.isSelf ? 'Deuwi Satriya Irawan' : '';
        },

        submitPresence() {
            if (!this.isFormValid || this.isSubmitting) return;
            this.isSubmitting = true;

            try {
                const outlet = this.outlets.find(o => o.id === this.selectedOutletId);
                const shift = this.shifts.find(s => s.id === this.selectedShiftId);
                if (!outlet || !shift) {
                    this.showPresenceModal('❌', 'Error', 'Outlet or shift not found.');
                    this.isSubmitting = false;
                    return;
                }

                const start = this.parseTimeToMinutes(shift.start);
                const end = this.parseTimeToMinutes(shift.end);
                const now = new Date();
                const nowMin = now.getHours() * 60 + now.getMinutes();

                let lateMin = 0, isLate = false, lateType = '';
                if (this.presenceType === 'masuk') {
                    const diff = nowMin - start;
                    if (diff > 15) { isLate = true; lateMin = Math.floor(diff); lateType = 'check-in'; }
                } else {
                    const diff = nowMin - end;
                    if (diff > 30) { isLate = true; lateMin = Math.floor(diff); lateType = 'check-out'; }
                }

                const label = this.presenceType === 'masuk' ? 'Check In' : 'Check Out';
                let msg = `Thank you for your presence, ${this.name.trim()}! 🙏\n`;
                msg += isLate
                    ? `⚠️ You were late for ${lateType} by ${lateMin} minute(s).\nPlease be more punctual in the future. ⏰`
                    : `✅ You are on time for ${label}. Great job!\nKeep up the good work! 💪`;

                const lateMsg = isLate
                    ? `⏰ Late by ${lateMin} minute(s) (tolerance: ${this.presenceType === 'masuk' ? '15' : '30'} min)`
                    : '';

                this.showPresenceModal(
                    isLate ? '⚠️' : '✅',
                    'Presence Result',
                    msg,
                    isLate,
                    lateMsg,
                    this.photoPreview || null
                );

                this.resetForm();
                this.isSubmitting = false;
            } catch (e) {
                console.error(e);
                this.showPresenceModal('❌', 'Error', 'An error occurred. Please try again.');
                this.isSubmitting = false;
            }
        },

        goHome() {
            const isHome = window.location.pathname.endsWith('index.html') ||
                           window.location.pathname === '/' ||
                           window.location.pathname === '';
            if (isHome) {
                const el = document.querySelector('.app-body');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.showToast('🏠 Returned to main menu');
            } else {
                window.location.href = 'index.html';
            }
        }
    }));

    // ─── COMPONENT: REKAP APP ─────────────────────────────────────────

    Alpine.data('rekapApp', () => ({
        currentTime: '--:--:--',
        clockInterval: null,
        outlets: [
            { id: 1, name: 'My Fried Chicken' },
            { id: 2, name: 'Raja Kepiting' },
            { id: 3, name: 'Ayam Bebek Ganza' }
        ],
        shifts: [
            { id: 1, name: 'Pagi' },
            { id: 2, name: 'Sore' },
            { id: 3, name: 'Malam' }
        ],
        selectedOutletId: null,
        selectedShiftId: null,
        filteredData: [],
        allData: [dummyEmployee],

        init() {
            this.updateClock();
            this.clockInterval = setInterval(() => this.updateClock(), 1000);
            this.applyFilter();
        },

        updateClock() {
            const now = new Date();
            this.currentTime = String(now.getHours()).padStart(2, '0') + ':' +
                               String(now.getMinutes()).padStart(2, '0') + ':' +
                               String(now.getSeconds()).padStart(2, '0');
        },

        applyFilter() {
            let filtered = this.allData;
            if (this.selectedOutletId) {
                filtered = filtered.filter(e => e.outlet_id === this.selectedOutletId);
            }
            if (this.selectedShiftId) {
                filtered = filtered.filter(e => e.shift_id === this.selectedShiftId);
            }
            this.filteredData = filtered;
        },

        viewDetail(id) {
            const params = new URLSearchParams();
            params.append('id', id);
            if (this.selectedOutletId) params.append('outlet', this.selectedOutletId);
            if (this.selectedShiftId) params.append('shift', this.selectedShiftId);
            window.location.href = `detail.html?${params.toString()}`;
        },

        getRowClass(status) {
            if (status === 'on-time') return 'table-success';
            if (status === 'late-5-15') return 'table-warning';
            if (status === 'late-30-60') return 'table-danger';
            return '';
        },

        getBadgeClass(status) {
            if (status === 'on-time') return 'bg-success';
            if (status === 'late-5-15') return 'bg-warning text-dark';
            if (status === 'late-30-60') return 'bg-danger';
            return 'bg-secondary';
        },

        getStatusLabel(status) {
            if (status === 'on-time') return 'On Time';
            if (status === 'late-5-15') return 'Late 5-15 min';
            if (status === 'late-30-60') return 'Late 30-60 min';
            return '-';
        },

        showToast(message) {
            const el = document.getElementById('toastModal');
            if (el) {
                const msgEl = el.querySelector('.toast-message');
                if (msgEl) msgEl.textContent = message;
                new bootstrap.Modal(el).show();
            }
        },

        goHome() {
            const isHome = window.location.pathname.endsWith('index.html') ||
                           window.location.pathname === '/' ||
                           window.location.pathname === '';
            if (isHome) {
                const el = document.querySelector('.app-body');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.showToast('🏠 Returned to main menu');
            } else {
                window.location.href = 'index.html';
            }
        }
    }));

    // ─── COMPONENT: DETAIL APP ────────────────────────────────────────

    Alpine.data('detailApp', () => ({
        currentTime: '--:--:--',
        clockInterval: null,
        employee: null,
        loading: true,
        employeeId: null,
        outletId: null,
        shiftId: null,
        outlets: [
            { id: 1, name: 'My Fried Chicken' },
            { id: 2, name: 'Raja Kepiting' },
            { id: 3, name: 'Ayam Bebek Ganza' }
        ],
        shifts: [
            { id: 1, name: 'Pagi' },
            { id: 2, name: 'Sore' },
            { id: 3, name: 'Malam' }
        ],
        allEmployees: [dummyEmployee],

        init() {
            this.updateClock();
            this.clockInterval = setInterval(() => this.updateClock(), 1000);
            const params = new URLSearchParams(window.location.search);
            const idParam = params.get('id');
            if (!idParam) {
                this.loading = false;
                this.employee = null;
                return;
            }
            this.employeeId = parseInt(idParam);
            if (isNaN(this.employeeId)) {
                this.loading = false;
                this.employee = null;
                return;
            }
            this.outletId = parseInt(params.get('outlet')) || null;
            this.shiftId = parseInt(params.get('shift')) || null;
            this.loadDetail();
        },

        updateClock() {
            const now = new Date();
            this.currentTime = String(now.getHours()).padStart(2, '0') + ':' +
                               String(now.getMinutes()).padStart(2, '0') + ':' +
                               String(now.getSeconds()).padStart(2, '0');
        },

        loadDetail() {
            this.loading = true;
            const emp = this.allEmployees.find(e => e.id === this.employeeId);
            if (!emp) {
                this.loading = false;
                this.employee = null;
                return;
            }

            const history = generateHistory();
            const outlet = this.outlets.find(o => o.id === emp.outlet_id);
            const shift = this.shifts.find(s => s.id === emp.shift_id);

            this.employee = {
                ...emp,
                outlet_name: outlet ? outlet.name : 'Unknown',
                shift_name: shift ? shift.name : 'Unknown',
                history: history
            };

            setTimeout(() => { this.loading = false; }, 400);
        },

        getRowClass(status) {
            if (status === 'on-time') return 'table-success';
            if (status === 'late-5-15') return 'table-warning';
            if (status === 'late-30-60') return 'table-danger';
            return '';
        },

        getBadgeClass(status) {
            if (status === 'on-time') return 'bg-success';
            if (status === 'late-5-15') return 'bg-warning text-dark';
            if (status === 'late-30-60') return 'bg-danger';
            return 'bg-secondary';
        },

        getStatusLabel(status) {
            if (status === 'on-time') return 'On Time';
            if (status === 'late-5-15') return 'Late 5-15 min';
            if (status === 'late-30-60') return 'Late 30-60 min';
            return '-';
        },

        showToast(message) {
            const el = document.getElementById('toastModal');
            if (el) {
                const msgEl = el.querySelector('.toast-message');
                if (msgEl) msgEl.textContent = message;
                new bootstrap.Modal(el).show();
            }
        },

        goHome() {
            const isHome = window.location.pathname.endsWith('index.html') ||
                           window.location.pathname === '/' ||
                           window.location.pathname === '';
            if (isHome) {
                const el = document.querySelector('.app-body');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.showToast('🏠 Returned to main menu');
            } else {
                window.location.href = 'index.html';
            }
        }
    }));
});