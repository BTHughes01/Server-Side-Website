const deleteForm = document.getElementById('deleteForm');

// loading the table on website load
addEventListener('load', async function () {
    try {
        const response = await fetch('http://localhost:8090/data/all');
        const body = await response.text();
        const data = await JSON.parse(body);

        const allSellers = await data.allSellers;
        const allCustomers = await data.allCustomers;
        const allSoftwares = await data.allSoftwares;

        fillTable('sellerTable', allSellers);
        fillTable('customerTable', allCustomers);
        fillTable('softwareTable', allSoftwares);
    } catch (e) {
        alert(e);
    }
});

// adding event for delete form
deleteForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const data = { type: deleteForm.entity.value, ID: deleteForm.id.value };

    // adding a confirm for the user
    if (confirm('Are you sure you want to delete ' + data.type + ' ' + data.ID + '?')) {
        deleteForm.reset();

        // sending the delete request
        try {
            const response = await fetch('http://localhost:8090/delete',
            {
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
                },
                method: 'DELETE',
                body: JSON.stringify(data)
            });
            const body = await response.text();
            const newData = await JSON.parse(body);

            if (data.error === undefined) {
                document.getElementById('deleteConfirm').innerHTML = data.ID + ' was successfully deleted';
            } else {
                alert('Error ' + newData.error);
            }
        } catch (e) {
            alert(e);
        }
        // updating the table after the deletion
        try {
            const response = await fetch('http://localhost:8090/data/all');
            const body = await response.text();
            const data = await JSON.parse(body);

            const allSellers = await data.allSellers;
            const allCustomers = await data.allCustomers;
            const allSoftwares = await data.allSoftwares;

            document.getElementById('sellerTable').innerHTML = '<tbody><tr><th>Seller ID</th><th>Name</th><th>Software IDs</th></tr></tbody>';
            document.getElementById('customerTable').innerHTML = '<tbody><tr><th>customer ID</th><th>Name</th><th>softwares Owned</th><th>address</th></tr></tbody>';
            document.getElementById('softwareTable').innerHTML = '<tbody><tr><th>Software ID</th><th>Seller ID</th><th>Customer IDs</th><th>Name</th><th>Device Type</th></tr></tbody>';

            fillTable('sellerTable', allSellers);
            fillTable('customerTable', allCustomers);
            fillTable('softwareTable', allSoftwares);
        } catch (e) {
            alert(e);
        }
    }
});
