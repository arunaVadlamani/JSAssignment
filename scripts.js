class Products {
  async init() {
    const items = await this.getItems();
    this.displayProducts(items);
  }

  async getItems() {
    try {
      let response = await fetch("https://fakestoreapi.com/products");
      if (response.status == 200) {
        this.items = await response.json();
        document.getElementById("loader").style.display = "none";
        return this.items;
      }
      throw new Error(response.status);
    } catch (err) {
      console.error(err);
      document.getElementById("searchContainer").style.display = "none";
      document.getElementById("menu").style.display = "none";
      document.getElementById("pageTitle").style.display = "none";
    }
  }
  displayProducts = items => {
    if (items.length) {
      const template = document.getElementById("template-list-item");
      const templateHtml = template.innerHTML;
      let listHtml = "";

      for (let key in items) {
        const formattedTitle = this.textTrim(items[key]["title"], 20, "...");
        listHtml += templateHtml
          .replace(/{{img}}/g, items[key]["image"])
          .replace(/{{id}}/g, items[key]["id"])
          .replace(/{{price}}/g, items[key]["price"])
          .replace(/{{name}}/g, formattedTitle);
      }

      document.getElementById("list").innerHTML = listHtml;
    }
  };

  textTrim = (str, max = 50, suffix = "...") =>
    str.length < max
      ? str
      : `${str.substr(
          0,
          str.substr(0, max - suffix.length).lastIndexOf(" ")
        )}${suffix}`;
}

class Cart extends Products {
  constructor() {
    super();
    this.cartItems = [];
  }
  async init() {
    super.init();
    const items = await this.getItems();
    const cartItemsStorage = sessionStorage.getItem("cartItems");
    const cartTotalStorage = sessionStorage.getItem("cartTotal");
    this.cartItems = cartItemsStorage ? JSON.parse(cartItemsStorage) : [];
    this.cartTotal = cartItemsStorage ? JSON.parse(cartTotalStorage) : 0;

    if (this.cartItems.length) {
      this.updateCart();
    }
    if (this.cartTotal > 0) {
      this.displayCartTotal();
    }

    document.getElementById("menu").addEventListener("click", () => {
      this.showSidebar();
    });

    document.getElementById("sidebar-close").addEventListener("click", () => {
      this.hideSidebar();
    });

    document.querySelectorAll(".btn-add").forEach(item => {
      item.addEventListener("click", event => {
        const id = Number(event.target.getAttribute("data-product-id"));
        const selectedProduct = items.find(item => item.id === id);
        this.addToCart(selectedProduct);
      });
    });
    this.addButtonStyling();
  }

  addToCart = obj => {
    this.cartItems.push(obj);
    sessionStorage.setItem("cartItems", JSON.stringify(this.cartItems));
    this.updateCart();
  };
  updateCart() {
    if (this.cartItems.length) {
      const template = document.getElementById("template-cart-item");
      const templateHtml = template.innerHTML;
      let listHtml = "";
      for (let key in this.cartItems) {
        const formattedTitle = this.textTrim(
          this.cartItems[key]["title"],
          20,
          "..."
        );
        listHtml += templateHtml
          .replace(/{{img}}/g, this.cartItems[key]["image"])
          .replace(/{{id}}/g, this.cartItems[key]["id"])
          .replace(/{{price}}/g, this.cartItems[key]["price"])
          .replace(/{{name}}/g, formattedTitle);
      }

      document.getElementById("cart").innerHTML = listHtml;

      this.cartTotal = this.cartItems.reduce(
        (total, amount) => total + amount.price,
        0
      );
      document.getElementById("headerCart").innerHTML = this.cartItems.length;

      this.displayCartTotal();
      this.displayCartClear();

      sessionStorage.setItem("cartTotal", JSON.stringify(this.cartTotal));
      document.getElementById("menu").classList.add("header-cart-full");
      this.addButtonStyling();
    } else {
      this.resetCart();
    }
    document.querySelectorAll(".cart-item-remove").forEach(item => {
      item.addEventListener("click", event => {
        event.stopPropagation();
        const id = Number(event.target.getAttribute("data-product-id"));
        const selectedProduct = this.items.find(item => item.id === id);
        this.removeFromCart(selectedProduct);
      });
    });
    document
      .getElementById("headerCart")
      .classList.add("animate-animated", "animate-pulse");
    setTimeout(() => {
      document
        .getElementById("headerCart")
        .classList.remove("animate-animated", "animate-pulse");
    }, 1000);
  }
  addButtonStyling = () => {
    if (this.cartItems.length) {
      document.querySelectorAll(".btn-add,.btn-search-add").forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = 'ADD TO CART';
      });
      for (let key in this.cartItems) {
        document
          .querySelectorAll(
            `.btn-add[data-product-id = "${String(this.cartItems[key]["id"])}"]`
          )
          .forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = 'ADDED';
          });
        document
          .querySelectorAll(
            `.btn-search-add[data-product-id = "${this.cartItems[key]["id"]}"]`
          )
          .forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = 'ADDED';
          });
      }
    } else {
      document.querySelectorAll(`.btn-add`).forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = 'ADD TO CART';
      });
      document.querySelectorAll(`.btn-search-add`).forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = 'ADD TO CART';
      });
    }
  };
  displayCartTotal = () => {
    const cartTotalFormatted = this.cartTotal.toFixed(2);
    const template = document.getElementById("template-cart-total");
    const templateHtml = template.innerHTML;
    let cartTotalHtml = "";
    cartTotalHtml += templateHtml.replace(/{{total}}/g, cartTotalFormatted);

    document.getElementById("cartTotal").innerHTML = cartTotalHtml;
  };

  displayCartClear = () => {
    const template = document.getElementById("template-remove-all-cart");
    const templateHtml = template.innerHTML;
    let cartClearHtml = "";
    cartClearHtml += templateHtml;
    document.getElementById("cartClear").innerHTML = cartClearHtml;

    document.querySelector(".btn-remove-all").addEventListener("click", () => {
      this.removeAllFromCart();
    });
  };

  resetCart = () => {
    document.getElementById("cart").innerHTML = " ";
    document.getElementById("cartTotal").innerHTML = "";
    document.getElementById("cartClear").innerHTML = "";
    document.getElementById("headerCart").innerHTML = "0";
    document.getElementById("menu").classList.remove("header-cart-full");
    this.hideSidebar();
    this.addButtonStyling();
  };

  removeFromCart = obj => {
    this.cartItems = this.cartItems.filter(function(item) {
      return item.id !== obj.id;
    });
    sessionStorage.setItem("cartItems", JSON.stringify(this.cartItems));
    this.updateCart();
  };

  removeAllFromCart = () => {
    this.cartItems = [];
    sessionStorage.setItem("cartItems", []);
    this.resetCart();
  };

  showSidebar = () => {
    if (this.cartItems.length) {
      const sidebar = document.getElementById("sidebar");
      const isOpen = sidebar.classList.contains("slide-in");
      sidebar.classList = isOpen ? "sidebar slide-out" : "sidebar slide-in";
      document.body.classList.add("show-overlay");
      const menuElement = document.getElementById("menu");
      this.detectOutsideClick(this.hideSidebar, sidebar, menuElement);
    }
  };

  hideSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList = "sidebar slide-out";
    document.body.classList.remove("show-overlay");
  };

  detectOutsideClick(callback, ...elements) {
    document.addEventListener("click", event => {
      const isClickInside = elements.some(e => e.contains(event.target));
      if (!isClickInside) {
        callback();
      }
    });
  }
}

class SearchBar extends Cart {
  constructor() {
    super();
  }
  init() {
    super.init();
    const searchDebounce = this.debounce(() => {
      this.searchItems();
    }, 250);

    document.getElementById("searchBar").addEventListener("keyup", function() {
      searchDebounce();
    });

    const searchResultsElement = document.getElementById("searchContainer");
    this.detectOutsideClick(this.resetSearchBar, searchResultsElement);
  }
  debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  };

  addToCart(obj) {
    super.addToCart(obj);
  }
  async searchItems() {
    const searchString = document.getElementById("searchBar").value;
    const items = await this.getItems();
    if (searchString.length >= 3) {
      const filteredItems = items.filter(item => {
        return (
          item.title.toLowerCase().includes(searchString) ||
          item.description.toLowerCase().includes(searchString)
        );
      });
      this.displaySearchItems(filteredItems);
    } else {
      document.getElementById("searchItems").innerHTML = "";
    }
  }
  displaySearchItems = items => {
    if (items.length) {
      const template = document.getElementById("template-search-item");
      const templateHtml = template.innerHTML;
      let listHtml = "";

      for (let key in items) {
        listHtml += templateHtml
          .replace(/{{img}}/g, items[key]["image"])
          .replace(/{{id}}/g, items[key]["id"])
          .replace(/{{price}}/g, items[key]["price"])
          .replace(/{{name}}/g, items[key]["title"]);
      }

      document.getElementById("searchItems").innerHTML = listHtml;

      this.addButtonStyling();

      document.querySelectorAll(".btn-search-add").forEach(item => {
        item.addEventListener("click", event => {
          const id = Number(event.target.getAttribute("data-product-id"));
          const selectedProduct = items.find(item => item.id === id);
          this.addToCart(selectedProduct);
        });
      });
    } else {
      const template = document.getElementById("template-search-blank");
      const templateHtml = template.innerHTML;
      let listHtml = templateHtml;

      document.getElementById("searchItems").innerHTML = listHtml;
    }
  };
  resetSearchBar = () => {
    document.getElementById("searchBar").value = "";
    document.getElementById("searchItems").innerHTML = "";
  };
}

let searchBar = new SearchBar();
searchBar.init();
