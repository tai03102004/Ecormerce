'use strict'

const {
    extend
} = require("lodash");

const StatusCode = {
    OK: 200,
    CREATED: 201,
}

const ReasonStatusCode = {
    CREATED: "Created!",
    OK: "Success",
}

class SuccessResponse {
    constructor({
        message = ReasonStatusCode.OK,
        status = StatusCode.OK,
        reasonStatusCode = ReasonStatusCode.OK,
        metadata = {}
    }) {
        this.message = !message ? reasonStatusCode : message;
        this.reasonStatusCode = reasonStatusCode;
        this.metadata = metadata;
        this.status = status;
    }
    send(res, headers = {}) {
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({
        message,
        metadata
    }) {
        super({
            message,
            metadata
        });
    }
}

class Created extends SuccessResponse {
    constructor({
        message,
        status = StatusCode.CREATED,
        reasonStatusCode = ReasonStatusCode.CREATED,
        metadata
    }) {
        super({
            message,
            status,
            reasonStatusCode,
            metadata
        });
    }
}

module.exports = {
    OK,
    Created,
    SuccessResponse
};