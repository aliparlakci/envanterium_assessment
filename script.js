function readFile(fileName){ return require('fs').readFileSync(fileName, 'utf8') }

function readJSON(fileName) { return JSON.parse(readFile(fileName)) }

function exportProducts(rawProducts) {
    products = {}

    for(x in rawProducts) {
        products[rawProducts[x].barcode] = {
            sku: rawProducts[x].sku,
            urun_adi: rawProducts[x]['urun adi'],
            totalAmount: 0
        }
    }

    return products
}

function exportStorages(rawStorages) {
    storages = {}

    for(x in rawStorages) {
        storages[rawStorages[x]['locationCode']] = []
        for (y in rawStorages[x]['completedCounts'][0]['contents']) {
            product = rawStorages[x]['completedCounts'][0]['contents'][y]
            storages[rawStorages[x]['locationCode']].push({
                barcode: product.barcode,
                amount: product.amount
            })                
        }
    }
    return storages
}

function calculateTotal(products,storages) {

    for (x in storages) {
        for (y in storages[x]) {
            products[storages[x][y].barcode].totalAmount += storages[x][y].amount
        }
    }
    return products
}

function report1(storages) {
    report = "location;barcode;amount\n"

    for (x in storages) {
        for (y in storages[x]) {
            report +=   x + ";"
                      + storages[x][y].barcode + ";"
                      + storages[x][y].amount
                      + "\n"
        }
    }
    return report
}

function report2(products) {
    report = "barcode;amount\n"
    for (x in products) {
        report +=   x + ";"
                  + products[x].totalAmount + "\n"
    }
    return report
}

function report3(products,storages) {

    report = "location;barcode;amount;sku;urun adi \n"
    for (x in storages) {
        for (y in storages[x]) {
            report +=   x + ";"
                      + storages[x][y].barcode + ";"
                      + storages[x][y].amount + ";"
                      + products[storages[x][y].barcode].sku + ";"
                      + products[storages[x][y].barcode].urun_adi + "\n"
        }
    }
    return report
}

function writeToFile(fileName, data) {
    require('fs').writeFile(fileName, data, (err) => {
        if (err) throw err;
      });
}

var products = exportProducts(readJSON('master.json'))
var storages = exportStorages(readJSON('counts.json'))

products = calculateTotal(products,storages)

writeToFile("report1.txt",report1(storages))
writeToFile("report2.txt",report2(products))
writeToFile("report3.txt",report3(products,storages))