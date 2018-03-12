// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
import Promise from 'bluebird';

import artifacts from '../../build/contracts/SeaFoodContract.json'

var SeaFoodContract = contract(artifacts);
var accounts;
var account;
var cont;
var data = [];
var transactionEvent;
var entityData = [];
var owners = [];
var entities = [];
var transactionData = [];

window.App = {
  start: function () {
    var self = this;
    SeaFoodContract.setProvider(web3.currentProvider);
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        self.setStatus(err);
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
      accounts = accs;
      self.toConsole("Accounts ", accounts);
      web3.eth.defaultAccount = accounts[0];
      SeaFoodContract.web3.eth.defaultAccount = SeaFoodContract.web3.eth.coinbase;
      self.toConsole("Default Account", web3.eth.defaultAccount);
      account = accounts[0];
      return;
    });
    SeaFoodContract.deployed().then((instance) => {
      cont = instance;
      self.toConsole("Contract", cont);
      self.refresh();
      App.populateValues();
      transactionEvent = cont.Transaction();
      self.toConsole("Transaction", transactionEvent);
      self.watchTransaction(transactionEvent);
      return instance;
    }).then((cont) => {
      cont.addAsFisherMan(accounts[1], 'Suarez', { from: accounts[1], gas: 3000000 })
      cont.addAsBuyer(accounts[2], 'Messi', { from: accounts[2], gas: 3000000 });
      cont.addAsRestaurantOwner(accounts[3], 'Ronaldo', { from: accounts[3], gas: 3000000 });
      return cont.owner();
    }).then(val => {
      self.setLogin(" Admin " + self.convertToLink(val));
      self.createStakeHoldersTable();
    }).catch(e => self.logError(e));
  },

  populateValues: () => {
    cont.owners(0).then(val => {
      owners.push(val);
      return cont.owners(1);
    }).then(val => {
      owners.push(val);
      return cont.owners(2);
    }).then(val => {
      owners.push(val);
      return cont.owners(3);
    }).then(val => {
      owners.push(val);
      return;
    }).then(() => {
      return cont.item_names(0);
    }).then(val => {
      entities.push(val);
      return cont.item_names(1);
    }).then(val => {
      entities.push(val);
      return cont.item_names(2);
    }).then(val => {
      entities.push(val);
      return;
    }).then(() => App.createTransferElements()).catch(e => self.logError(e));
  },

  createTransferElements: () => {
    App.populateSelectElementValues(entities, 'entitySelect');
    App.populateSelectElementValues(owners, 'oldOwnerSelect');
    App.populateSelectElementValues(accounts, 'senderSelect');
    App.populateSelectElementValues(accounts, 'receiverSelect');
    App.populateSelectElementValues(owners, 'newOwnerSelect');
  },

  populateSelectElementValues: (data, element) => {
    var select = document.getElementById(element);
    select.setAttribute('id', element);
    select.innerHTML = "";
    var option;
    data.forEach((item) => {
      option = document.createElement('option');
      option.value = option.textContent = item;
      select.appendChild(option);
    });
  },
  onChangeEntitySelect: (val) => {
    var element = document.getElementById('oldOwnerSelect');
    cont.getEntity(val).then(item => {
      element.value = item[2];
      element.onchange();
    }).catch(e => App.logError(e));
  },

  onChangeOwnerSelect: (val, id) => {
    App.setError("");
    if (id == "oldOwnerSelect") {
      var element = document.getElementById('senderSelect');
      cont.getOwnerAddress(val).then(addr => {
        element.value = addr;
      }).catch(e => App.logError(e));
    }
    else if (id == "newOwnerSelect") {
      var element = document.getElementById('oldOwnerSelect');
      if (element.value == val) {
        App.logError("Please select different owner");
        return;
      }
      var element = document.getElementById('receiverSelect');
      cont.getOwnerAddress(val).then(addr => {
        element.value = addr;
      }).catch(e => App.logError(e));
    }
  },

  logError: (err) => {
    console.error(err);
    App.setError(err);
    alert(err);
  },

  refresh: () => {
    data = [];
    entityData = [];
    App.setError("");
    App.createStakeHoldersData();
    App.createEntityData();
  },

  toConsole: (param, msg) => {
    console.log(param + ": ", msg);
  },

  convertToLink: function (msg) {
    return '<a href="javascript:void()" title='+msg+' >' + msg + '</a>';
  },

  setLogin: function (message) {
    var login = document.getElementById("login");
    login.innerHTML = message;
  },

  setError: function (message) {
    var error = document.getElementById("errorDiv");
    error.innerHTML = message;
  },

  watchTransaction: (event) => {
    event.watch(function (err, result) {
      if (err) {
        App.logError(err);
        return;
      }
      transactionData.push({
        "Block hash": result.blockHash,
        "Block Number": result.blockNumber,
        "Transaction Hash": result.transactionHash,
        "From": result.args.from,
        "Old Owner": result.args.oldOwner,
        "To": result.args.to,
        "New Owner": result.args.newOwner,
        "Entity Name": result.args.name,
        "Amount": result.args.amount
      });
      App.showTransactionData(result.blockHash, result.blockNumber, result.transactionHash,
        result.args.from, result.args.oldOwner, result.args.to, result.args.name, result.args.amount, result.args.newOwner);
      App.toConsole("Transaction ", result);
    });
  },

  showTransactionData: (blockhash, blockNumber, transactionhash, from, oldOwner, to, name, _amt, newOwner) => {
    var table = document.getElementById("transactionTable");
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);
    var cell8 = row.insertCell(7);
    var cell9 = row.insertCell(8);
    cell1.innerHTML = App.convertToLink(blockhash);
    cell2.innerHTML = blockNumber;
    cell3.innerHTML = App.convertToLink(transactionhash);
    cell4.innerHTML = App.convertToLink(from);
    cell5.innerHTML = oldOwner;
    cell6.innerHTML = App.convertToLink(to);
    cell7.innerHTML = newOwner;
    cell8.innerHTML = name;
    cell9.innerHTML = _amt;
  },

  createStakeHoldersData: function () {
    var self = this;
    cont.getUser(accounts[0]).
      then(user => {
        cont.balances(accounts[0]).then(val => {
          data.push({ "Type": user[0], "Name": user[1], "Account": self.convertToLink(user[2]), "balance": val });
        });
        return cont.getUser(accounts[1])
      }).
      then(user => {
        cont.balances(accounts[1]).then(val => {
          data.push({ "Type": user[0], "Name": user[1], "Account": self.convertToLink(user[2]), "balance": val });
        });
        return cont.getUser(accounts[2])
      }).
      then(user => {
        cont.balances(accounts[2]).then(val => {
          data.push({ "Type": user[0], "Name": user[1], "Account": self.convertToLink(user[2]), "balance": val });
        });
        return cont.getUser(accounts[3])
      }).
      then(user => {
        cont.balances(accounts[3]).then(val => {
          data.push({ "Type": user[0], "Name": user[1], "Account": self.convertToLink(user[2]), "balance": val });
        });
      }).then(App.createEntityTable).catch(e => self.logError(e));
  },

  createStakeHoldersTable: function () {
    var col = [];
    for (var i = 0; i < data.length; i++) {
      for (var key in data[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }
    var table = document.createElement("table");
    var tr = table.insertRow(-1);                   // TABLE ROW.
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th");      // TABLE HEADER.
      th.innerHTML = col[i];
      tr.appendChild(th);
    }

    for (var i = 0; i < data.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data[i][col[j]];
      }
    }

    var divContainer = document.getElementById("table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
  },

  createEntityData: () => {
    var self = this;
    cont.item_names(0).
      then(name => {
        cont.getEntity(name).then(_entity => {
          entityData.push({ "Entity Name": _entity[0], "Value ": _entity[1], "Owner": _entity[2], "Account ": App.convertToLink(_entity[3]) });
        });
        return cont.item_names(1);
      }).
      then(name => {
        cont.getEntity(name).then(_entity => {
          entityData.push({ "Entity Name": _entity[0], "Value ": _entity[1], "Owner": _entity[2], "Account ": App.convertToLink(_entity[3]) });
        });
        return cont.item_names(2);
      }).
      then(name => {
        cont.getEntity(name).then(_entity => {
          entityData.push({ "Entity Name": _entity[0], "Value ": _entity[1], "Owner": _entity[2], "Account ": App.convertToLink(_entity[3]) });
        });
      }).catch(e => self.logError(e));
  },

  createEntityTable: () => {
    var col = [];
    for (var i = 0; i < entityData.length; i++) {
      for (var key in entityData[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }
    var table = document.createElement("table");
    var tr = table.insertRow(-1);                   // TABLE ROW.
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th");      // TABLE HEADER.
      th.innerHTML = col[i];
      tr.appendChild(th);
    }

    for (var i = 0; i < entityData.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = entityData[i][col[j]];
      }
    }

    var divContainer = document.getElementById("table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
  },

  createTransactionTable: () => {
    var col = [];
    for (var i = 0; i < entityData.length; i++) {
      for (var key in entityData[i]) {
        if (col.indexOf(key) === -1) {
          col.push(key);
        }
      }
    }
    var table = document.createElement("table");
    var tr = table.insertRow(-1);                   // TABLE ROW.
    for (var i = 0; i < col.length; i++) {
      var th = document.createElement("th");      // TABLE HEADER.
      th.innerHTML = col[i];
      tr.appendChild(th);
    }

    for (var i = 0; i < entityData.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = entityData[i][col[j]];
      }
    }

    var divContainer = document.getElementById("table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
  },

  transferEntity: () => {
    var e = document.getElementById("entitySelect");
    var entitySelect = (e != null && e.options[e.selectedIndex] != undefined) ? e.options[e.selectedIndex].text : "";
    e = document.getElementById("senderSelect");
    var senderSelect = (e != null && e.options[e.selectedIndex] != undefined) ? e.options[e.selectedIndex].text : "";
    e = document.getElementById("receiverSelect");
    var receiverSelect = (e != null && e.options[e.selectedIndex] != undefined) ? e.options[e.selectedIndex].text : "";
    e = document.getElementById("newOwnerSelect");
    var newOwnerSelect = (e != null && e.options[e.selectedIndex] != undefined) ? e.options[e.selectedIndex].text : "";
    e = document.getElementById("oldOwnerSelect");
    var oldOwnerSelect = (e != null && e.options[e.selectedIndex] != undefined) ? e.options[e.selectedIndex].text : "";
    if (!entitySelect || !newOwnerSelect || !oldOwnerSelect || !receiverSelect || !senderSelect) {
      App.logError(new Error("Please select correct values to transfer entity"));
      return;
    }

    if( oldOwnerSelect == newOwnerSelect){
      App.logError(new Error("Please select different owner "));
      return;
    }

    cont.buyEntity(senderSelect, receiverSelect, entitySelect, newOwnerSelect, oldOwnerSelect, { from: App.owner, gas: 3000000 }).then((val) => {
      if (!val) throw new Error("Error with the values");
      App.refresh();
    }).catch(e => App.logError(e));
  }

};

window.addEventListener('load', function () {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
