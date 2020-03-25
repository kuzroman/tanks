<template>
    <div id="app">
        <div class="online" :class="{red: isOffline}">{{status}}</div>

        <form
          v-if="!hasLogin"
          @submit.prevent="saveName(name)"
        >
            <label for="name">
                <input class="inputName" v-model="name"
                       required
                       autofocus
                       autocomplete="off"
                       placeholder="yourName"
                       maxlength="10"
                       id="name"
                       @input="inputName"
                />
            </label>
            <input type="submit" style="position: absolute; left: -9999px"/>
        </form>

        <template v-else>
            <div @click="rename" class="rename">Rename</div>
            <div class="rename">{{name}}</div>

            <div class="field">
                <div v-for="user in users"
                     class="tank"
                     :class="{'me': user.name === name}"
                     :style="{'top': user.top + 'px', 'left': user.left + 'px'}"
                >{{user.score}}</div>
            </div>
        </template>

    </div>
</template>

<script>
const ws = new WebSocket(`ws://${IP}:3000`);
const defaultClick = 10;
let idTimeout;
const SesName = 'SPName';
const defaultConnection = 'OFFLINE';

export default {
    name: 'App',
    data() {
        return {
            name: '',
            score: 0,
            top: 0,
            left: 0,

            users: [],
            hasLogin: '',
            status: defaultConnection,
            scores: 0,
            adminMode: false,
            clickToAdminMode: defaultClick,
        }
    },
    computed: {
        isOffline() {
            return this.status === defaultConnection;
        },
        user() {
            if (!this.users.length) {
                return {};
            }
            return this.users.find(i => i.name === this.name);
        },
    },
    watch: {
        user(user) {
            if (user && user.command === 'restoreName') {
                this.name = user.name || '';
                this.score = user.score || 0;
                this.top = user.top || 0;
                this.left = user.left || 0;
            }
        }
    },
    methods: {
        rename() {
            this.removeUser(this.name);
            sessionStorage.removeItem(SesName);
            this.hasLogin = false;
            this.name = '';
        },
        send(data) {
            ws.send(JSON.stringify(Object.assign(
                {name: this.name, score: this.score, top: this.top, left: this.left}, data)
            ));
        },
        updateScore(num) {
            this.score++;
            this.send({command: 'setScore'});
        },
        setStatus(value) {
            this.status = value;
        },
        saveName(name) {
            name = name.trim();
            if (!name || this.findUserByName(name)) {
                return;
            }
            this.name = name;
            this.hasLogin = true;
            sessionStorage.setItem(SesName, this.name);
            this.send({command: 'saveName'});
        },
        restoreSession() {
            let sessionName = sessionStorage.getItem(SesName);
            if (!sessionName) {
                return;
            }
            this.name = sessionName;
            this.hasLogin = true;
            this.send({command: 'restoreName'});
        },
        findUserByName(name) {
            return this.users.find(i => i.name === name);
        },
        removeUser(name) {
            this.send({command: 'removeUser', name});
        },
        adminModeActivator() {
            this.clickToAdminMode--;
            if (this.clickToAdminMode < 0) {
                this.adminMode = true;
            }
            clearTimeout(idTimeout);
            if (this.adminMode) {
                return;
            }
            idTimeout = setTimeout(() => {
                this.clickToAdminMode = defaultClick;
            }, 500)
        },
        inputName() {
            this.name = this.name.replace(/[^a-zA-Zа-яА-Я-]+/g, '');
        },
    },
    created() {

        ws.onmessage = response => {
            console.log(JSON.parse(response.data));
            this.users = JSON.parse(response.data);
        };

        ws.onopen = () => {
            this.restoreSession();
            this.setStatus('Online');
        };
        ws.onclose = () => this.setStatus(defaultConnection);

        document.body.addEventListener('click', this.adminModeActivator);

        document.onkeydown = (e) => {
            let code = e.keyCode;
            if(!this.hasLogin || code < 37 || code > 40) {
                return;
            }
            switch (code) {
                case 37:this.left--; break;
                case 38:this.top--;  break;
                case 39:this.left++; break;
                case 40:this.top++;  break;
            }
            this.send({command: 'setPosition'});
        };
    }
};
</script>
