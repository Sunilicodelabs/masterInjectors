const chargebee = require("chargebee")
chargebee.configure({
    site: process.env.REACT_APP_CHARGEBEE_SITE_NAME,
    api_key: process.env.CHARGEBEE_API_KEY
});



exports.createCustomer = (req, res) => {
    const { id = '', email = '', first_name = '', last_name = '' } = req.body;
    chargebee.customer.create({
        id, email, first_name, last_name
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
        } else {
            console.log(result.customer, 'resss');
            res
                .status(200)
                .send(result.customer)
                .end();
        }
    });
}
exports.createCourse = (req, res) => {
    const { id = '', name = '', type = "charge", item_family_id = "Package", price = null } = req.body;
    chargebee.item.create({
        id,
        name,
        type,
        item_family_id,
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
            console.log(error);
        } else {
            var item = result.item;
            if (price) {
                createItemPrice(id, result, price).then((resu) => {
                    res
                        .status(200)
                        .send(resu)
                        .end();
                })
            } else {
                res
                    .status(200)
                    .send(item)
                    .end();
            }
        }
    });
}

const createItemPrice = (id, result, price) => {
    return new Promise((resolve, reject) => {
        chargebee.item_price.create({
            id: id,
            item_id: id,
            name: result.item.name,
            pricing_model: "PER_UNIT",
            price: price,
        }).request(function (error, result) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

exports.updateCourse = (req, res) => {
    const { id = '', name = '', type = "charge", item_family_id = "Package", price = null } = req.body;
    chargebee.item.update(id, {
        id,
        name,
        item_family_id,
        parent_item_id: type
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
            console.log(error);
        } else {
            var item = result.item;
            if (price) {
                updateItemPrice(id, result, price).then((resu) => {
                    res.status(200).send(resu);
                });
            } else {
                console.log('else ram');
                res
                    .status(200)
                    .send(item)
                    .end();
            }
        }
    });
}

const updateItemPrice = (id, result, price) => {
    return new Promise((resolve, reject) => {
        chargebee.item_price.update(id, {
            id: id,
            item_id: id,
            name: result.item.name,
            price: price,
            pricing_model: "PER_UNIT",
        }).request(function (error, result) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};


exports.deleteCourse = (req, res) => {
    const { id = '', name = '', type = "charge", item_family_id = "Package" } = req.body;
    // return null
    chargebee.item.create({
        id,
        name,
        type,
        item_family_id,
        price: '300'
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
            //handle error
            console.log(error);
        } else {
            console.log(result, 'ram');
            var item = result.item;
            res
                .status(200)
                .send(result.item)
                .end();
        }


    });
}


exports.subscribe = (req, res) => {
    const { plan_id, id, email, first_name, last_name } = req.body;
    chargebee.hosted_page.checkout_new_for_items({
        subscription_items: [
            {
                item_price_id: plan_id,
            }
        ],
        customer: {
            id,
            email,
            first_name,
            last_name
        },
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
        } else {
            res
                .status(200)
                .send(result.hosted_page)
                .end();
        }
    });
}

exports.checkoutExisting = (req, res) => {
    const { subId, newPlanId } = req.body;
    chargebee.hosted_page.checkout_existing_for_items({
        subscription: {
            id: subId
        },
        subscription_items: [{
            item_price_id: newPlanId
        }]
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
        } else {
            res
                .status(200)
                .send(result.hosted_page)
                .end()
        }
    })
}

exports.createSessionPortal = (req, res) => {
    const { id } = req.body;
    chargebee.portal_session.create({
        customer: {
            id,
        },
    }).request(function (error, result) {
        if (error) {
            const { http_status_code } = error;
            res
                .status(http_status_code)
                .send(error)
                .end()
        } else {
            res
                .status(200)
                .send(result.portal_session)
                .end();
        }
    });
}

exports.getSubscriptionInfo = (req, res) => {
    const { customer_id } = req.body;
    chargebee.subscription.list({
        limit: 10,
        "customer_id[is]": customer_id,
    }).request(function (e, result) {
        if (e) {
            const { http_status_code } = e;
            res
                .status(http_status_code)
                .send(e)
                .end()
        } else {
            res
                .status(200)
                .send(result.list)
                .end()
        }
    })
}

exports.retrieveHostedPage = (req, res) => {
    const { hostedPageId } = req.body;
    chargebee.hosted_page.retrieve(hostedPageId)
        .request(function (error, result) {
            if (error) {
                const { http_status_code } = error;
                res
                    .status(http_status_code)
                    .send(error)
                    .end()
            } else {
                res
                    .status(200)
                    .send(result.hosted_page)
                    .end()
            }
        })
}

exports.getSavedCards = (req, res) => {
    const { customer_id } = req.body;
    chargebee.payment_source.list({
        "customer_id[is]": customer_id,
        "type[is]": "card"
    }).request(function (e, result) {
        if (e) {
            const { http_status_code } = e;
            res
                .status(http_status_code)
                .send(e)
                .end()
        } else {
            res
                .status(200)
                .send(result.list)
                .end()
        }
    })
}

exports.getChargebeeTransactions = (req, res) => {
    const { limit = 3, customer_id } = req.body;
    chargebee.transaction.list({
        limit,
        "sort_by[desc]": "date",
        "customer_id[is]": customer_id,
    }).request(function (e, result) {
        if (e) {
            const { http_status_code } = e;
            res
                .status(http_status_code)
                .send(e)
                .end()
        } else {
            res
                .status(200)
                .send(result.list)
                .end()
        }
    })
}

exports.getChargebeeInvoices = (req, res) => {
    const { limit = 3, customer_id } = req.body;
    chargebee.invoice.list({
        limit,
        "sort_by[desc]": "date",
        "customer_id[is]": customer_id,
    }).request(function (e, result) {
        if (e) {
            const { http_status_code } = e;
            res
                .status(http_status_code)
                .send(e)
                .end()
        } else {
            res
                .status(200)
                .send(result.list)
                .end()
        }
    })
}