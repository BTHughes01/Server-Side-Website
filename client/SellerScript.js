// selecting both forms
const sellerForm = document.getElementById('sellerForm');
const newSoftwareForm = document.getElementById('newSoftwareForm');

let currentSellerID;

// getting the seller data
sellerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const sellerID = sellerForm.sellerID.value;
    sellerForm.sellerID.value = '';

    // requesting seller info from the server
    try {
        const sellerResponse = await fetch('http://localhost:8090/seller/' + sellerID + '/info');
        const sellerBody = await sellerResponse.text();
        const sellerData = await JSON.parse(sellerBody);

        // if there is no error then show user details
        if (sellerData.error === undefined) {
            document.getElementById('sellerData').innerHTML = '<strong>Welcome, </strong>' + sellerData.sellerID + ' ' + sellerData.name;

        // alerting to error
        } else {
            alert(sellerData.error);
            return;
        }
    } catch (e) {
        alert(e);
        return;
    }

    try {
    // getting seller software list from the server
    const softwaresResponse = await fetch('http://localhost:8090/seller/' + sellerID + '/softwares');
    const softwaresBody = await softwaresResponse.text();
    const softwaresData = await JSON.parse(softwaresBody);

    // if no error with request
    if (softwaresData.error === undefined) {
        currentSellerID = sellerID;

        // printing results to a table

        const table = document.getElementById('sellerSoftwareTable');
        table.innerHTML = '<tbody><tr><th>software ID</th><th>software Name</th><th>device Type</th></tr></tbody>';
        for (const element of softwaresData) {
            const row = table.insertRow(1);
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.innerHTML = element.softwareID;
            cell2.innerHTML = element.name;
            cell3.innerHTML = element.deviceType;
}
    } else {
        alert(softwaresData.error);
        return;
    }
    } catch (e) {
        alert(e);
        return;
    }

    // getting seller's customer list
    try {
        const customersResponse = await fetch('http://localhost:8090/seller/' + sellerID + '/customers');
        const customersBody = await customersResponse.text();
        const customersData = await JSON.parse(customersBody);

        // if no error
        if (customersData.error === undefined) {
            // presenting in a table
            const customerTable = document.getElementById('sellerCustomerTable');
            customerTable.innerHTML = '<tbody><tr><th>customer ID</th><th>Name</th><th>softwares Owned</th><th>address</th></tr></tbody>';
            fillTable('sellerCustomerTable', customersData);
            } else {
            alert(customersData.error);
        }
    } catch (e) {
        alert(e);
    }
});

// adding new software for a given seller
newSoftwareForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // if the form is empty
    if (currentSellerID === undefined) {
        alert('No user selected');
        return;
    }

    // getting data from the form
    const softwareName = newSoftwareForm.name.value;
    const softwareDevice = newSoftwareForm.deviceType.value;

    newSoftwareForm.deviceType.value = newSoftwareForm.name.value = '';

    // sending a push request to the server to add the new seller
    try {
        const response = await fetch('http://localhost:8090/seller/newSoftware',
        {
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ sellerID: currentSellerID, softwareName, softwareDevice })
        });

        // reading server response
        const body = await response.text();
        const data = await JSON.parse(body);
        console.log(data);

        // if no error from server
        if (data.error === undefined) {
            document.getElementById('newSoftwareConfirm').innerHTML = 'New Software, <strong>' + softwareName + '</strong> Registered with ID: <strong>' + data.newID + '</strong>';

            // updating the table after the new software was added

            try {
                const sellerID = currentSellerID;

                const softwaresResponse = await fetch('http://localhost:8090/seller/' + sellerID + '/softwares');
                const softwaresBody = await softwaresResponse.text();
                const softwaresData = await JSON.parse(softwaresBody);

                // if no error
                if (softwaresData.error === undefined) {
                    currentSellerID = sellerID;
                    console.log(softwaresData);

                    // writing to the table
                    const table = document.getElementById('sellerSoftwareTable');
                    table.innerHTML = '<tbody><tr><th>software ID</th><th>software Name</th><th>device Type</th></tr></tbody>';
                    for (const element of softwaresData) {
                        const row = table.insertRow(1);
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        cell1.innerHTML = element.softwareID;
                        cell2.innerHTML = element.name;
                        cell3.innerHTML = element.deviceType;
}
                } else {
                    alert(data.error);
                }
                } catch (e) {
                    alert(e);
                }
        } else {
            alert('Error ' + data.error);
        }
    } catch (e) {
        alert(e);
    }
});
