const express = require('express');
const fs = require('fs');
const app = express();

// function to return all software sold by a given seller
function getSellerSoftwares (data, sellerID) {
    // getting the sellers data
    const seller = data.allSellers.find(x => x.sellerID === sellerID);

    // if the seller is found
    if (seller !== undefined) {
        const sellerSoftwares = [];

        // adding all softwares that the seller sells to the list
        for (const sellerSoftwareID of seller.softwareIDs) {
            sellerSoftwares.push(data.allSoftwares.find(x => x.softwareID === sellerSoftwareID));
        }

        // sending the software
        return (sellerSoftwares);
    } else {
        // returns an error if no user is found with the id
        return ({ error: 'No User Found' });
    }
}

// a function used to remove data from the
function removeSoftware (data, softwareID) {
    // saving the software data, sellerID and customerID list
    const software = data.allSoftwares.find(x => x.softwareID === softwareID);
    const sellerID = software.sellerID;
    const customers = software.customerIDs;

    // removing the software from the data
    data.allSoftwares = data.allSoftwares.filter(function (el) { return el !== software; });

    // deleting the reference in the seller data
    data.allSellers.find(x => x.sellerID === sellerID).softwareIDs = data.allSellers.find(x => x.sellerID === sellerID).softwareIDs.filter(function (el) { return el !== softwareID; });

    // deleting the references in the customer data
    for (const customerID of customers) {
        data.allCustomers.find(x => x.customerID === customerID).softwareIDs = data.allCustomers.find(x => x.customerID === customerID).softwareIDs.filter(function (el) { return el !== softwareID; });
    }

    return data;
}

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// sends the data
app.get('/data/:dataType', function (req, resp) {
    const dataType = req.params.dataType;

    // sending back requested data
    if (['Sellers', 'Customers', 'Softwares'].includes(dataType)) {
        const data = JSON.parse(fs.readFileSync('data.json'));
        resp.status(200);
        resp.json(data['all' + dataType]);

    // sending back all data
    } else if (dataType === 'all') {
        const data = JSON.parse(fs.readFileSync('data.json'));
        resp.status(200).json(data);

    // handling error with data request
    } else {
        resp.status(400);
        resp.json({ error: 'no data' });
    }
});

app.post('/newSeller', function (req, resp) {
    // opening the file with the data
    const data = JSON.parse(fs.readFileSync('data.json'));

    // creating the new seller
    const newID = 'sl' + data.newSellerID;
    data.newSellerID += 1;
    data.allSellers.push({ sellerID: newID, name: req.body.name, softwareIDs: [] });

    // writing the new data to the file
    fs.writeFileSync('data.json', JSON.stringify(data));

    // sending back the new seller's ID
    resp.status(201);
    resp.json(newID);
});

app.post('/newCustomer', function (req, resp) {
    // opening the file with the data
    const data = JSON.parse(fs.readFileSync('data.json'));

    // creating the new customer
    const newID = 'c' + data.newCustomerID;
    data.newCustomerID += 1;
    data.allCustomers.push({ customerID: newID, name: req.body.name, softwareIDs: [], address: req.body.address });

    // writing the new data to the file
    fs.writeFileSync('data.json', JSON.stringify(data));

    // sending the new customerID
    resp.status(201);
    resp.send(newID);
});

app.get('/customerSoftware/:customerID', function (req, resp) {
    // opening the data file
    const data = JSON.parse(fs.readFileSync('data.json'));

    // finding the customer object to see their softwares they own
    const customer = data.allCustomers.find(x => x.customerID === req.params.customerID);

    // if the customer is found
    if (customer !== undefined) {
        const customerSoftwares = [];

        // adding all the software objects that they own to customerSoftwares and returning them
        for (const customerSoftwareID of customer.softwareIDs) {
                customerSoftwares.push(data.allSoftwares.find(x => x.softwareID === customerSoftwareID));
        }
        resp.status(200);
        resp.json({ softwares: customerSoftwares, info: customer });
    } else {
        resp.status(400);
        resp.json({ error: 'No User Found' });
    }
});

app.post('/customer/buy', function (req, resp) {
    // opening the data file
    const data = JSON.parse(fs.readFileSync('data.json'));

    // getting customerID and softwareID from the post request
    const customerID = req.body.customerID;
    const softwareID = req.body.softwareID;

    // finding the customer object to see their softwares they own
    const customer = data.allCustomers.find(x => x.customerID === customerID);
    const software = data.allSoftwares.find(x => x.softwareID === softwareID);

    if (customer !== undefined) {
        if (software !== undefined) {
            // both software and customer id are valid

            // checking if the software is listed for the customer
            if (customer.softwareIDs.includes(softwareID) === false && software.customerIDs.includes(customerID) === false) {
                // adding software and customer references
                data.allCustomers.find(x => x.customerID === customerID).softwareIDs.push(softwareID);
                data.allSoftwares.find(x => x.softwareID === softwareID).customerIDs.push(customerID);
                fs.writeFileSync('data.json', JSON.stringify(data));

                resp.status(200);
                resp.json('Successfully added <strong>' + softwareID + ' ' + software.name + '</strong> to Customer <strong>' + customerID + ' ' + customer.name + '</strong>');
            } else {
                resp.status(400);
                resp.json({ error: 'User already owns selected software' });
            }
        } else {
            resp.status(400);
            resp.json({ error: 'No software with ID ' + softwareID });
        }
    } else {
        resp.status(400);
        resp.send({ error: 'No customer with ID ' + customerID });
    }
});

app.get('/seller/:sellerID/:dataType', function (req, resp) {
    // sending the requested data type
    if (['softwares', 'customers'].includes(req.params.dataType)) {
        const data = JSON.parse(fs.readFileSync('data.json'));
        const sellerID = req.params.sellerID;

        const sellerSoftwares = getSellerSoftwares(data, sellerID);

        // if the user is requesting seller's software
        if (req.params.dataType === 'softwares') {
            resp.status(200);
            resp.json(sellerSoftwares);

        // if the user is requesting seller's customers and there was no error
        } else if (sellerSoftwares.error === undefined) {
            const sellerCustomersArray = [];

            // looping through each piece of software
            for (const software of sellerSoftwares) {
                const sellerCustomerIDsArray = software.customerIDs;

                // looping through each customer id for each piece of software the seller sells
                for (const ID of sellerCustomerIDsArray) {
                    // finding the customer corresponding to the ID
                    const sellerCustomer = data.allCustomers.find(x => x.customerID === ID);

                    // if the customer is not in the return array then they are added
                    if (sellerCustomersArray.includes(sellerCustomer) === false) {
                        sellerCustomersArray.push(sellerCustomer);
                    }
                }
            }
            resp.status(200);
            resp.json(sellerCustomersArray);
        } else {
            resp.status(200);
            resp.json(sellerSoftwares);
        }

    // if the user is requesting info about the user themself
    } else if (req.params.dataType === 'info') {
        const data = JSON.parse(fs.readFileSync('data.json'));
        const seller = data.allSellers.find(x => x.sellerID === req.params.sellerID);

        if (seller === undefined) {
            resp.status(400);
            resp.json({ error: 'No seller found' });
        } else {
            resp.status(200);
            resp.json(seller);
        }
    } else {
        resp.status(400);
        resp.json({ error: 'no data type ' + req.params.dataType });
    }
});

app.post('/seller/newSoftware', function (req, resp) {
        // opening the data file
        const data = JSON.parse(fs.readFileSync('data.json'));
        const newData = req.body;

        const seller = data.allSellers.find(x => x.sellerID === newData.sellerID);

        if (seller === undefined) {
            resp.send({ error: 'No seller with ID ' + newData.sellerID });
        } else {
            // creating the new software ID and incrementing the counter
            const newSoftwareID = 'sf' + data.newSoftwareID;
            data.newSoftwareID += 1;

            // adding the new software reference to the seller
            data.allSellers.find(x => x.sellerID === newData.sellerID).softwareIDs.push(newSoftwareID);

            // adding the new software to the data
            data.allSoftwares.push({ softwareID: newSoftwareID, sellerID: newData.sellerID, customerIDs: [], name: newData.softwareName, deviceType: newData.softwareDevice });
            fs.writeFileSync('data.json', JSON.stringify(data));

            resp.status(201);
            resp.json({ newID: newSoftwareID });
        }
});

app.delete('/delete', function (req, resp) {
    // getting the data
    const inData = req.body;
    let data = JSON.parse(fs.readFileSync('data.json'));

    // choosing which type of data is being deleted
    switch (inData.type) {
        case 'customer':{
            // if customer not in dataset
            const customer = data.allCustomers.find(x => x.customerID === inData.ID);
            if (customer === undefined) {
                resp.status(400);
                resp.json({ error: 'No User with ID ' + inData.ID });
            } else {
                // saving the customer's software list
                const customerSoftwares = customer.softwareIDs;

                // deleting the customer from the database
                data.allCustomers = data.allCustomers.filter(function (el) { return el.customerID !== inData.ID; });

                console.log(customerSoftwares);
                // going through all the customers softwares and removing the reference to the customer
                for (const removeID of customerSoftwares) {
                    data.allSoftwares.find(x => x.softwareID === removeID).customerIDs = data.allSoftwares.find(x => x.softwareID === removeID).customerIDs.filter(function (el) { return el !== inData.ID; });
                }
                // writing the file at the end
                fs.writeFileSync('data.json', JSON.stringify(data));
                resp.status(200);
                resp.json({ message: 'success' });
                }
            }

            break;

        case 'software':{
            // if software in dataset
            const software = data.allSoftwares.find(x => x.softwareID === inData.ID);
            if (software === undefined) {
                // return error if software not in dataset
                resp.status(400);
                resp.json({ error: 'No Software with ID ' + inData.ID });
            } else {
                // removing software from dataset
                data = removeSoftware(data, inData.ID);
                fs.writeFileSync('data.json', JSON.stringify(data));

                resp.status(200);
                resp.json({ message: 'success' });
            }
        }
            break;

        case 'seller':{
            // if seller in dataset
            const seller = data.allSellers.find(x => x.sellerID === inData.ID);
            if (seller === undefined) {
                resp.status(400);
                resp.json({ error: 'No Seller with ID ' + inData.ID });
            } else {
                // getting the seller's software list

                const softwares = seller.softwareIDs;
                for (const softwareID of softwares) {
                    data = removeSoftware(data, softwareID);
                }

                data.allSellers = data.allSellers.filter(function (el) { return el.sellerID !== inData.ID; });

                fs.writeFileSync('data.json', JSON.stringify(data));

                resp.status(200);
                resp.json({ message: 'success' });
            }
        }
            break;
    }
});

app.use(express.static('client'));

module.exports = app;
