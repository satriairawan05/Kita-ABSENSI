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

    // ─── GENERATE HISTORY UNTUK 1 KARYAWAN ────────────────────────────

    function generateHistoryForEmployee() {
        const history = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Periode 1: 20 Mei – 8 Juni, Shift Sore di Raja Kepiting (16:00 - 00:00)
        let start = new Date(2026, 4, 20);
        let end = new Date(2026, 5, 8);
        let current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const lateMin = Math.floor(Math.random() * 45);
            let status = 'on-time';
            if (lateMin > 15 && lateMin <= 30) status = 'late-5-15';
            else if (lateMin > 30) status = 'late-30-60';
            history.push({
                date: dateStr,
                date_formatted: formatDate(dateStr),
                shift: 'Sore',
                shift_start: '16:00',
                shift_end: '00:00',
                check_in: addMinutes('16:00', lateMin),
                check_out: addMinutes('00:00', lateMin),
                status: status
            });
            current.setDate(current.getDate() + 1);
        }

        // Periode 2: 10 Juni – hari ini, Shift Sore di My Fried Chicken (15:00 - 23:00)
        start = new Date(2026, 5, 10);
        end = new Date(today);
        // Batasi sampai 27 Juni 2026 (untuk konsistensi data)
        const maxEnd = new Date(2026, 5, 27);
        if (end > maxEnd) end = maxEnd;

        current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];

            const isOff = (dateStr === '2026-06-20');

            if (!isOff) {
                const lateMin = Math.floor(Math.random() * 45);
                let status = 'on-time';
                if (lateMin > 15 && lateMin <= 30) status = 'late-5-15';
                else if (lateMin > 30) status = 'late-30-60';
                history.push({
                    date: dateStr,
                    date_formatted: formatDate(dateStr),
                    shift: 'Sore',
                    shift_start: '15:00',
                    shift_end: '23:00',
                    check_in: addMinutes('15:00', lateMin),
                    check_out: addMinutes('23:00', lateMin),
                    status: status
                });
            }
            // Jika OFF, tidak dimasukkan ke history (tidak ada data)

            current.setDate(current.getDate() + 1);
        }

        history.sort((a, b) => new Date(a.date) - new Date(b.date));
        return history;
    }

    // ─── DATA DUMMY DENGAN STATUS TERAKHIR DARI HISTORY ──────────────

    function getDummyEmployee() {
        const history = generateHistoryForEmployee();
        // Cari data terakhir yang bukan OFF (selalu ada karena history hanya berisi data)
        const lastLog = history.length > 0 ? history[history.length - 1] : null;
        return {
            id: 1,
            nama: 'Deuwi Satriya Irawan',
            outlet_id: 1,
            shift_id: 2,
            total_absen: history.length,
            status: lastLog ? lastLog.status : 'on-time',
            history: history
        };
    }

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
            this.modalIcon = icon || '✅';
            this.modalTitle = title || 'Presence Result';
            this.modalMessage = message || 'Thank you for your presence!';
            this.modalLate = late;
            this.modalLateMessage = lateMsg || '';
            this.modalPhoto = photo !== null;
            this.modalPhotoPreview = photo;

            const el = document.getElementById('presenceModal');
            if (el) {
                try {
                    const existing = bootstrap.Modal.getInstance(el);
                    if (existing) existing.dispose();
                    const modal = new bootstrap.Modal(el);
                    modal.show();
                } catch (e) {
                    console.warn('Modal error:', e);
                    alert(message);
                }
            } else {
                console.error('presenceModal not found');
                alert(message);
            }
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
                    this.showPresenceModal('❌', 'Error', 'Outlet or Shift not found.');
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
                    if (diff > 15) {
                        isLate = true;
                        lateMin = Math.floor(diff);
                        lateType = 'Check In';
                    }
                } else {
                    const diff = nowMin - end;
                    if (diff > 30) {
                        isLate = true;
                        lateMin = Math.floor(diff);
                        lateType = 'Check Out';
                    }
                }

                const label = this.presenceType === 'masuk' ? 'Check In' : 'Check Out';

                let msg = `Hello ${this.name.trim()}, your ${label} has been successfully recorded! 🙏\n\n`;
                msg += `📍 Outlet: ${outlet.name}\n`;
                msg += `⏰ Shift: ${shift.name} (${shift.start} - ${shift.end})\n\n`;

                if (isLate) {
                    msg += `⚠️ Status: Late by ${lateMin} minute(s) for your scheduled shift.`;
                } else {
                    msg += `✅ Status: On Time. Great job, keep up the good work! 💪`;
                }

                const lateMsg = isLate
                    ? `⏰ Late by ${lateMin} minute(s) (Tolerance: ${this.presenceType === 'masuk' ? '15' : '30'} mins)`
                    : '';

                this.showPresenceModal(
                    isLate ? '⚠️' : '✅',
                    isLate ? 'Presence Warning' : 'Presence Success',
                    msg,
                    isLate,
                    lateMsg,
                    this.photoPreview || null
                );

                this.resetForm();
                this.isSubmitting = false;
            } catch (e) {
                console.error(e);
                this.showPresenceModal('❌', 'Error', 'A system error occurred. Please try again.');
                this.isSubmitting = false;
            }
        },

        goHome() {
            window.location.assign('index.html');
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
        allData: [],

        init() {
            this.updateClock();
            this.clockInterval = setInterval(() => this.updateClock(), 1000);
            this.loadData();
        },

        updateClock() {
            const now = new Date();
            this.currentTime = String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');
        },

        loadData() {
            const emp = getDummyEmployee();
            this.allData = [{
                id: emp.id,
                nama: emp.nama,
                outlet_id: emp.outlet_id,
                shift_id: emp.shift_id,
                total_absen: emp.total_absen,
                status: emp.status
            }];
            this.applyFilter();
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
            window.location.assign('index.html');
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

        // State Kalender
        currentDate: null,
        calendarDays: [],
        dayStatusMap: {},
        minDate: null,
        maxDate: null,

        get canPrev() {
            if (!this.currentDate || !this.minDate) return false;
            const currentMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const minMonth = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
            return currentMonth > minMonth;
        },

        get canNext() {
            if (!this.currentDate || !this.maxDate) return false;
            const currentMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
            return currentMonth < maxMonth;
        },

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
            const empData = getDummyEmployee();

            if (empData.id !== this.employeeId) {
                this.loading = false;
                this.employee = null;
                return;
            }

            const outlet = this.outlets.find(o => o.id === empData.outlet_id);
            const shift = this.shifts.find(s => s.id === empData.shift_id);

            this.employee = {
                ...empData,
                outlet_name: outlet ? outlet.name : 'Unknown',
                shift_name: shift ? shift.name : 'Unknown'
            };

            // Tentukan batas bulan dari data history
            const history = empData.history;
            if (history.length > 0) {
                const firstDate = new Date(history[0].date);
                const lastDate = new Date(history[history.length - 1].date);
                this.minDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
                this.maxDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
            } else {
                this.minDate = new Date(2026, 4, 1); // Mei 2026
                this.maxDate = new Date(2026, 5, 1); // Juni 2026
            }

            // Build map status
            this.dayStatusMap = {};
            empData.history.forEach(log => {
                this.dayStatusMap[log.date] = log.status;
            });

            // Set currentDate ke bulan pertama data
            if (!this.currentDate || this.currentDate < this.minDate) {
                this.currentDate = new Date(this.minDate);
            }

            this.renderCalendar();
            this.loading = false;
        },

        renderCalendar() {
            if (!this.currentDate) return;

            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const days = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Empty days before month starts
            for (let i = 0; i < firstDay; i++) {
                days.push(null);
            }

            // Days of the month
            for (let d = 1; d <= daysInMonth; d++) {
                const dateObj = new Date(year, month, d);
                const dateStr = dateObj.toISOString().split('T')[0];
                const status = this.dayStatusMap[dateStr] || null;
                const isPast = dateObj <= today;

                days.push({
                    date: d,
                    dateStr: dateStr,
                    status: isPast ? status : null,
                    isToday: dateObj.toDateString() === today.toDateString(),
                    isPast: isPast
                });
            }

            this.calendarDays = days;
        },

        prevMonth() {
            const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
            if (newDate >= this.minDate) {
                this.currentDate = newDate;
                this.renderCalendar();
            }
        },

        nextMonth() {
            const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
            if (newDate <= this.maxDate) {
                this.currentDate = newDate;
                this.renderCalendar();
            }
        },

        get currentMonthYear() {
            if (!this.currentDate) return '';
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
            return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        },

        getDayClass(day) {
            if (!day) return '';
            if (!day.isPast) return 'future-date';
            if (!day.status) return 'bg-calendar-no-data';
            if (day.status === 'on-time') return 'bg-calendar-on-time';
            if (day.status === 'late-5-15') return 'bg-calendar-late-5-15';
            if (day.status === 'late-30-60') return 'bg-calendar-late-30-60';
            return 'bg-calendar-no-data';
        },

        getBadgeClass(status) {
            if (status === 'on-time') return 'bg-success';
            if (status === 'late-5-15') return 'bg-warning text-dark';
            if (status === 'late-30-60') return 'bg-danger';
            return 'bg-secondary';
        },

        getStatusLabel(status) {
            if (status === 'on-time') return 'On Time';
            if (status === 'late-5-15') return 'Late 5-15';
            if (status === 'late-30-60') return 'Late 30-60';
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
            window.location.assign('index.html');
        }
    }));
});