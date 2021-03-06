import { Action } from 'corky/flux/action';
var request = require('superagent');

export class ConditionalRequestAction {

    constructor(type, url, requestType,  requestAction,requestPayload, callback,options) {
        this.type = type;
        this.url = url;
        this.requestType = requestType;
        this.options = options || {};
        this.request = new Action(`${type}.REQUEST`);
        this.response = new Action(`${type}.RESPONSE`);
        this.error = new Action(`${type}.ERROR`);
    }

    payload(payload) {
        if (payload === undefined) payload = { data: {}, query: {} };
        if (payload.data === undefined) payload.data = {};
        if (payload.query === undefined) payload.query = {};

        if (this.url === undefined) throw new Error(`Parameter url is missing in RequestAction: ${this.type}.`);
        if (this.requestType === undefined) throw new Error(`Parameter requestType is missing in RequestAction: ${this.type}.`);



        return (dispatch) => {
            dispatch(this.request.payload(payload));

            var data = {};

            if (payload.template === undefined) {
                data.template = {};
            } else {
                data.template = payload.template;
                delete payload.template;
            }

            if (payload.url === undefined) {
                data.url = this.url;
            } else {
                data.url = payload.url;
                delete payload.url;
            }

            if (payload.requestType === undefined) {
                data.requestType = this.requestType;
            } else {
                data.requestType = payload.requestType;
                delete payload.requestType;
            }

            if (payload.options === undefined) {
                data.options = this.options;
            } else {
                data.options = payload.options;
                delete payload.options;
            }

            if (this.url === undefined) throw new Error(`Parameter url is missing in RequestAction: ${this.type}.`);
            if (this.requestType === undefined) throw new Error(`Parameter requestType is missing in RequestAction: ${this.type}.`);

            var regex = /{(.*?)}/g;
            let match = [];

            while (match = regex.exec(data.url)) {
                let key = match[0];
                let value = match[1];

                if (data.template[value] !== undefined) {
                    data.url = data.url.replace(key, data.template[value]);
                }
            }

            request(data.requestType, data.url)
                .send(payload.data)
                .query(payload.query)
                .set(data.options)
                .end((err, res) => {
                    if (err !== null) {
                        dispatch(this.error.payload(err));
                    } else {
                        if(callback(res.body) === true){
                            dispatch(requestAction.payload(requestPayload));
                        }
                        
                    }
                });
        }
    }

}