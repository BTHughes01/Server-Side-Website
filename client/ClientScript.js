// saving all form objects
const customerForm = document.getElementById('customerForm');
let currentCustomerID;
const buyForm = document.getElementById('buyForm');

// loading the table on site load
window.addEventListener('load', async function () {
    // requesting table data
    try {
        const response = await fetch('http://localhost:8090/data/Softwares');
        const body = await response.text();
        const data = await JSON.parse(body);

        // writing data to the table
        const table = this.document.getElementById('softwareTable');
        for (const element of data) {
            const row = table.insertRow(1);
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            cell1.innerHTML = element.softwareID;
            cell2.innerHTML = element.name;
            cell3.innerHTML = element.sellerID;
            cell4.innerHTML = element.deviceType;
        }
    } catch (e) {
        alert(e);
    }
});

// getting the customer's data
customerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const custID = customerForm.customerID.value;
    customerForm.customerID.value = '';

    try {
        // requesting the data from the server
        const response = await fetch('http://localhost:8090/customerSoftware/' + custID);
        const body = await response.text();
        const data = await JSON.parse(body);

        // if no error
        if (data.error === undefined) {
            currentCustomerID = custID;

            // writing data to a table
            const table = document.getElementById('customerSoftwareTable');
            table.innerHTML = '<tbody><tr><th>software ID</th><th>software Name</th><th>seller ID</th> <th>device Type</th></tr></tbody>';
            const tableData = await data.softwares;
            for (const element of tableData) {
                const row = table.insertRow(1);
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);
                cell1.innerHTML = element.softwareID;
                cell2.innerHTML = element.name;
                cell3.innerHTML = element.sellerID;
                cell4.innerHTML = element.deviceType;
}
            const customerInfo = data.info;

            // writing customer info
            document.getElementById('customerInfo').innerHTML = '<strong>Hello, </strong>' + customerInfo.customerID + ' ' + customerInfo.name;
        } else {
            currentCustomerID = undefined;
            alert(data.error);
        }
    } catch (e) {
        alert(e);
    }
});

// handling the buy request
buyForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // if no data entered into form
    if (currentCustomerID === undefined) {
        alert('No user selected');
        return;
    }

    // getting form data
    const softwareID = buyForm.softwareID.value;
    const customerID = currentCustomerID;

    // sending buy request
    try {
        const response = await fetch('http://localhost:8090/customer/buy',
            {
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({ softwareID, customerID })
            });

        const body = await response.text();
        const data = await JSON.parse(body);

        // if no error
        if (data.error === undefined) {
            buyForm.softwareID.value = '';
            document.getElementById('buyConfirm').innerHTML = data;

            // updating the table

            const response2 = await fetch('http://localhost:8090/customerSoftware/' + customerID);
            const body2 = await response2.text();
            const data2 = await JSON.parse(body2);

            // drawing the table
            const table = document.getElementById('customerSoftwareTable');
            table.innerHTML = '<tbody><tr><th>software ID</th><th>software Name</th><th>seller ID</th> <th>device Type</th></tr></tbody>';
            for (const element of data2.softwares) {
                const row = table.insertRow(1);
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);
                cell1.innerHTML = element.softwareID;
                cell2.innerHTML = element.name;
                cell3.innerHTML = element.sellerID;
                cell4.innerHTML = element.deviceType;
}
        } else {
            alert('Error ' + data.error);
        }
    } catch (e) {
        alert(e);
    }
});
