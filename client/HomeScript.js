const sellerForm = document.getElementById('sellerForm');

sellerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = sellerForm.newSellerName.value;
    if (name !== '') {
    sellerForm.newSellerName.value = '';
    try {
    const response = await fetch('http://localhost:8090/newSeller',
    {
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ name })
    });
    const body = await response.text();
    document.getElementById('newSellerID').innerHTML = 'Thank you for registering, your ID is ' + body;
    } catch (e) {
        alert(e);
    }
    } else {
        alert('please enter valid name');
    }
});

const customerForm = document.getElementById('customerForm');

customerForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const newData = {
        name: customerForm.customerName.value,
        address: customerForm.customerAddress.value
    };
    if (newData.name !== '' && newData.address !== '') {
        customerForm.customerName.value = customerForm.customerAddress.value = '';
        console.log(newData);

        try {
            const response = await fetch('http://localhost:8090/newCustomer',
            {
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(newData)
            });
            const body = await response.text();
            document.getElementById('newCustomerID').innerHTML = 'Thank you for registering, your ID is ' + body;
        } catch (e) {
            alert(e);
        }
    } else {
        alert('please do not leave fields blank');
    }
});
