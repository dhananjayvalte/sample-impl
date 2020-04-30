const axios = require('axios');
const getToken = require('./token');

class HttpClient {
    static _headers(user, token) {
        return {
            'USER-NAME': user,
            'AUTH-TOKEN': token || '',
            'Content-Type': 'application/json'
        }
    };

    static POST(url, data, user, token) {
        return axios.post(url, data, {
            headers: HttpClient._headers(user, token)
        });
    };

    static PATCH(url, data, user, token) {
        return axios.patch(url, data, {
            headers: HttpClient._headers(user, token)
        });
    };

    static DELETE(url, data, user, token) {
        return axios.delete(url, {
            data,
            headers: HttpClient._headers(user, token)
        });
    };

    static req(method, url, data, user) {
        return HttpClient.getToken(user).then(token => HttpClient[method](url, data, user, token));
    }

    static load(secrets, env) {
        HttpClient.env = env;
        HttpClient.secrets = secrets[env];
    }

    static getToken(user) {
        if ((HttpClient.env === 'dev')) return Promise.resolve('');
        return getToken({
            serverUrl: HttpClient.secrets.serverUrl,
            user: user,
            password: HttpClient.secrets.password[user]
        });
    }

}

module.exports = HttpClient;