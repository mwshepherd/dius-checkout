var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var lineItems = [
    {
        sku: 'ipd',
        name: 'Super iPad',
        price: 549.99
    },
    {
        sku: 'mbp',
        name: 'MacBook Pro',
        price: 1399.99
    },
    {
        sku: 'atv',
        name: 'Apple TV',
        price: 109.5
    },
    {
        sku: 'vga',
        name: 'VGA adapter',
        price: 30.0
    },
];
var pricingRules = [
    {
        name: 'Apple TV 3 for 2 deal',
        sku: 'atv',
        quantity: 3,
        discountAmount: lineItems[2].price,
        apply: function (co) {
            var _this = this;
            var totalItems = 0;
            co.checkoutItems.forEach(function (item) {
                if (item.sku === _this.sku) {
                    totalItems = totalItems + 1;
                }
            });
            if (totalItems >= this.quantity) {
                var appliedDiscounts = co.checkoutDiscounts.filter(function (disc) { return disc.name === _this.name; }).length;
                var numberOfDiscounts = Math.floor(totalItems / this.quantity);
                if (appliedDiscounts < numberOfDiscounts) {
                    co.checkoutDiscounts.push({ name: this.name, amount: this.discountAmount });
                }
            }
        }
    },
    {
        name: 'Super iPad Bulk Discount',
        sku: 'ipd',
        quantity: 4,
        discountAmount: 50.0,
        apply: function (co) {
            var _this = this;
            var totalItems = co.checkoutItems.filter(function (item) { return item.sku === _this.sku; }).length;
            if (totalItems > this.quantity) {
                var appliedDiscount = co.checkoutDiscounts.filter(function (disc) { return disc.name === _this.name; }).length;
                var numberOfDiscounts = 1;
                if (appliedDiscount < numberOfDiscounts) {
                    co.checkoutDiscounts.push({ name: this.name, amount: this.discountAmount * totalItems });
                }
                var discount = co.checkoutDiscounts.filter(function (discount) { return discount.name === _this.name; })[0];
                if (discount) {
                    discount.amount = this.discountAmount * totalItems;
                }
            }
        }
    },
    {
        name: 'Free VGA with Macbook',
        sku: 'vga',
        quantity: 1,
        discountAmount: lineItems[3].price,
        apply: function (co) {
            var _this = this;
            var totalItems = co.checkoutItems.filter(function (item) { return item.sku === _this.sku; }).length;
            var mbpItems = co.checkoutItems.filter(function (item) { return item.sku === 'mbp'; }).length;
            if (totalItems >= this.quantity) {
                var appliedDiscounts = co.checkoutDiscounts.filter(function (disc) { return disc.name === _this.name; }).length;
                var numberOfDiscounts = Math.floor(totalItems / this.quantity);
                if (appliedDiscounts < numberOfDiscounts && mbpItems >= totalItems) {
                    co.checkoutDiscounts.push({ name: this.name, amount: this.discountAmount });
                }
            }
        }
    },
];
var Checkout = /** @class */ (function () {
    function Checkout(pricingRules) {
        this.pricingRules = pricingRules;
        this.checkoutItems = [];
        this.checkoutDiscounts = [];
        this.checkoutGrossTotal = 0;
        this.checkoutTotalDiscount = 0;
        this.checkoutNetTotal = 0;
    }
    Checkout.prototype.scan = function (item) {
        var _this = this;
        this.checkoutItems = __spreadArrays(this.checkoutItems, [item]);
        this.checkoutGrossTotal = this.checkoutGrossTotal + item.price;
        this.checkoutNetTotal = this.checkoutGrossTotal;
        if (this.pricingRules) {
            this.pricingRules.map(function (discount) { return discount.apply(_this); });
        }
    };
    Checkout.prototype.total = function () {
        var _this = this;
        if (this.checkoutDiscounts.length > 0) {
            this.checkoutDiscounts.forEach(function (discount) {
                _this.checkoutTotalDiscount = _this.checkoutTotalDiscount + discount.amount;
            });
            this.checkoutNetTotal = this.checkoutGrossTotal - this.checkoutTotalDiscount;
        }
        return {
            items: this.checkoutItems,
            discounts: this.checkoutDiscounts,
            grossTotal: this.checkoutGrossTotal,
            totalDiscount: this.checkoutTotalDiscount,
            netTotal: this.checkoutNetTotal
        };
    };
    return Checkout;
}());
var co = new Checkout(pricingRules);
// Example one SKUs Scanned: atv, atv, atv, vga Total expected: $249.00
// co.scan(lineItems[2]);
// co.scan(lineItems[2]);
// co.scan(lineItems[2]);
// co.scan(lineItems[3]);
// Example two SKUs Scanned: atv, ipd, ipd, atv, ipd, ipd, ipd Total expected: $2718.95
// co.scan(lineItems[2]);
// co.scan(lineItems[0]);
// co.scan(lineItems[0]);
// co.scan(lineItems[2]);
// co.scan(lineItems[0]);
// co.scan(lineItems[0]);
// co.scan(lineItems[0]);
// Examlpe three SKUs Scanned: mbp, vga, ipd Total expected: $1949.98
// co.scan(lineItems[1]);
// co.scan(lineItems[3]);
// co.scan(lineItems[2]);
console.log(co.total());
