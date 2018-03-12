pragma solidity ^0.4.18;
// We have to specify what version of compiler this code will compile with

contract SeaFoodContract {
  
  struct Entity {
    string name;
    uint value;
    string owner;
    address _address;
  }

  struct User {
    string owner;
    string name;
    address account;
  }

  address public owner;
  mapping (string => Entity)  entities;
  mapping (address => uint) public  balances;
  mapping (address => User)   users;
  mapping (string => uint)  items_value;
  mapping (string => address)  owner_address;
  string[] public owners;
  string[] public item_names;
  uint public tokenPrice;

  event Transaction(address from, address to, string name , uint amount ,string oldOwner,string newOwner);

  /* This is the constructor which will be called once when you
  deploy the contract to the blockchain. When we deploy the contract,
  */
  function SeaFoodContract() public {
    owner = msg.sender;
    tokenPrice = 10;
    owners = ["Admin","Fisherman","Buyer","Restauranteur"];
    item_names = ["Common carp","Gold Fish","Oscar"];
    balances[msg.sender] = 0;
    //for now admin is the creator
    owner_address[owners[0]] = owner;
    users[msg.sender] = User(owners[0],"Admin",owner);
    addEntities();
  }

  function getUser(address _address)  view public returns (string,string,address) {
    User memory _user = users[_address];
        return (_user.owner,_user.name,_address);
  }

  function getEntity(string _name)  view public returns (string,uint,string,address) {
    Entity memory _entity = entities[_name];
    return (_name,_entity.value,_entity.owner,_entity._address);
  }

  function addEntities()  public {
    entities[item_names[0]] = Entity(item_names[0],5,owners[0],owner);
    entities[item_names[1]] = Entity(item_names[1],10,owners[0],owner);
    entities[item_names[2]] = Entity(item_names[2],15,owners[0],owner);
    items_value[item_names[0]] = 5;
    items_value[item_names[1]] = 10;
    items_value[item_names[2]] = 15;
  }

  function getItemsValue(string _name) constant public returns (uint) {
     return items_value[_name];
  }

  function getOwnerAddress(string _name) constant public returns (address) {
     return owner_address[_name];
  }

 
  function addAsFisherMan(address _address,string name) public {
    users[_address] = User(owners[1],name,_address);
    owner_address[owners[1]] = _address;
    balances[_address] = 1000;
  }

  function addAsBuyer(address _address,string name) public {
    users[_address] = User(owners[2],name,_address);
    owner_address[owners[2]] = _address;
    balances[_address] = 1000;
  }

  function addAsRestaurantOwner(address _address,string name) public {
    users[_address] = User(owners[3],name,_address);
    owner_address[owners[3]] = _address;
    balances[_address] = 1000;
  }

  function buyEntity(address sender,address receiver,string _name,string newOwner,string oldOwner) public returns (bool) {

        uint value = getItemsValue(_name);
        uint tokensToBuy = value * tokenPrice;
        if ( balances[receiver] < tokensToBuy ) {
          return false;
        }
        Entity memory _entity = entities[_name];
        if ( _entity._address != sender ) {
          return false;
        }
        balances[sender] += tokensToBuy;
        balances[receiver] -= tokensToBuy;

      Transaction (sender, receiver,_name, value,oldOwner,newOwner);
       entities[_name] = Entity(_name,value,newOwner,receiver);
       return true;
  }

}
