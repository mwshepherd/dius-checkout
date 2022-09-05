interface Discount {
  name: string;
  sku: string;
  quantity: number;
  discountAmount: number;
  apply?: (co: Checkout) => void;
}

interface CheckoutItem {
  sku: string;
  name: string;
  price: number;
}

interface CheckoutDiscount {
  name: string;
  amount: number;
}

const lineItems = [
  {
    sku: 'ipd',
    name: 'Super iPad',
    price: 549.99,
  },
  {
    sku: 'mbp',
    name: 'MacBook Pro',
    price: 1399.99,
  },
  {
    sku: 'atv',
    name: 'Apple TV',
    price: 109.5,
  },
  {
    sku: 'vga',
    name: 'VGA adapter',
    price: 30.0,
  },
];

const pricingRules = [
  {
    name: 'Apple TV 3 for 2 deal',
    sku: 'atv',
    quantity: 3,
    discountAmount: lineItems[2].price,
    apply: function (co: Checkout) {
      let totalItems = 0;
      co.checkoutItems.forEach((item) => {
        if (item.sku === this.sku) {
          totalItems = totalItems + 1;
        }
      });

      if (totalItems >= this.quantity) {
        const appliedDiscounts = co.checkoutDiscounts.filter((disc) => disc.name === this.name).length;
        const numberOfDiscounts = Math.floor(totalItems / this.quantity);

        if (appliedDiscounts < numberOfDiscounts) {
          co.checkoutDiscounts.push({ name: this.name, amount: this.discountAmount });
        }
      }
    },
  },
  {
    name: 'Super iPad Bulk Discount',
    sku: 'ipd',
    quantity: 4,
    discountAmount: 50.0,
    apply: function (co: Checkout) {
      const totalItems = co.checkoutItems.filter((item) => item.sku === this.sku).length;

      if (totalItems > this.quantity) {
        const appliedDiscount = co.checkoutDiscounts.filter((disc) => disc.name === this.name).length;
        const numberOfDiscounts = 1;

        if (appliedDiscount < numberOfDiscounts) {
          co.checkoutDiscounts.push({ name: this.name, amount: this.discountAmount * totalItems });
        }

        const discount = co.checkoutDiscounts.filter((discount) => discount.name === this.name)[0];
        if (discount) {
          discount.amount = this.discountAmount * totalItems;
        }
      }
    },
  },
  {
    name: 'Free VGA with Macbook',
    sku: 'vga',
    quantity: 1,
    discountAmount: lineItems[3].price,
    apply: function (co: Checkout) {
      const totalItems = co.checkoutItems.filter((item) => item.sku === this.sku).length;
      const mbpItems = co.checkoutItems.filter((item) => item.sku === 'mbp').length;

      if (totalItems >= this.quantity) {
        const appliedDiscounts = co.checkoutDiscounts.filter((disc) => disc.name === this.name).length;
        const numberOfDiscounts = Math.floor(totalItems / this.quantity);

        if (appliedDiscounts < numberOfDiscounts && mbpItems >= totalItems) {
          co.checkoutDiscounts.push({ name: this.name, amount: this.discountAmount });
        }
      }
    },
  },
];

class Checkout {
  pricingRules: Discount[];
  checkoutItems: CheckoutItem[];
  checkoutDiscounts: CheckoutDiscount[];
  checkoutGrossTotal: number;
  checkoutTotalDiscount: number;
  checkoutNetTotal: number;

  constructor(pricingRules?: Discount[]) {
    this.pricingRules = pricingRules;
    this.checkoutItems = [];
    this.checkoutDiscounts = [];
    this.checkoutGrossTotal = 0;
    this.checkoutTotalDiscount = 0;
    this.checkoutNetTotal = 0;
  }

  scan(item: CheckoutItem) {
    this.checkoutItems = [...this.checkoutItems, item];
    this.checkoutGrossTotal = this.checkoutGrossTotal + item.price;
    this.checkoutNetTotal = this.checkoutGrossTotal;

    if (this.pricingRules) {
      this.pricingRules.map((discount) => discount.apply(this));
    }
  }

  total() {
    if (this.checkoutDiscounts.length > 0) {
      this.checkoutDiscounts.forEach((discount) => {
        this.checkoutTotalDiscount = this.checkoutTotalDiscount + discount.amount;
      });
      this.checkoutNetTotal = this.checkoutGrossTotal - this.checkoutTotalDiscount;
    }

    return {
      items: this.checkoutItems,
      discounts: this.checkoutDiscounts,
      grossTotal: this.checkoutGrossTotal,
      totalDiscount: this.checkoutTotalDiscount,
      netTotal: this.checkoutNetTotal,
    };
  }
}

const co = new Checkout(pricingRules);

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
