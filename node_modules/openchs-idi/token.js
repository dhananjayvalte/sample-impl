var axios = require('axios');
var Cognito = require('amazon-cognito-identity-js');
global.navigator = () => null;

const tokenCache = {};

module.exports = (config) => {
    const {serverUrl, user: username, password} = config;
    if (tokenCache[username]) return Promise.resolve(tokenCache[username]);

    return getCognitoDetails(serverUrl).then((details) => {
        const {poolId, clientId} = details;
        return getIdToken({username, password, poolId, clientId});
    });
};

const getCognitoDetails = (serverUrl) => {
    return axios.get(serverUrl + '/cognito-details', {'Content-Type': 'application/json'})
        .then(res=>res.data);
};

const getIdToken = (config) => {
    const {poolId, clientId, username, password} = config;

    var authenticationDetails = new Cognito.AuthenticationDetails({
        Username: username,
        Password: password
    });
    var userPool = new Cognito.CognitoUserPool({
        UserPoolId: poolId,
        ClientId: clientId
    });
    var cognitoUser = new Cognito.CognitoUser({Username: username, Pool: userPool});
    return new Promise((res,rej)=>{
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                res(result.getIdToken().getJwtToken());
            },
            onFailure: function (error) {
                rej("Authentication failure. Check credentials. " + "PoolId=" + poolId + " ClientId=" + clientId + " Username=" + username + " Password=" + password);
                console.log(error);
            },
            newPasswordRequired: function (_userAttributes, requiredAttributes) {
                const userAttributes = Object.assign({}, _userAttributes);
                delete userAttributes.phone_number_verified;
                delete userAttributes.email_verified;
                cognitoUser.completeNewPasswordChallenge(password, userAttributes, this);
            }
        });
    });
};
