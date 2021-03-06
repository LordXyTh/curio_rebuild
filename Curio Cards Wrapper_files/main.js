const web3 = new Web3(window.ethereum);

const contracts=[
  "0xfa63c1ADaB6C81491d807c35654a6e26386849e5",
    // "0x6Aa2044C7A0f9e2758EdAE97247B03a0D7e73d6c" //1
    // ,"0xE9A6A26598B05dB855483fF5eCc5f1d0C81140c8"
    // ,"0x3f8131B6E62472CEea9cb8Aa67d87425248a3702"
    // ,"0x4F1694be039e447B729ab11653304232Ae143C69"
    // ,"0x5a3D4A8575a688b53E8b270b5C1f26fd63065219"// 5"
    // ,"0x1Ca6AC0Ce771094F0F8a383D46BF3acC9a5BF27f"
    // ,"0x2647bd8777e0C66819D74aB3479372eA690912c3"
    // ,"0x2FCE2713a561bB019BC5A110BE0A19d10581ee9e"
    // ,"0xbf4Cc966F1e726087c5C55aac374E687000d4d45"
    // ,"0x72b34d637C0d14acE58359Ef1bF472E4b4c57125"// 10"
    // ,"0xb36c87F1f1539c5FC6f6e7b1C632e1840C9B66b4"
    // ,"0xD15af10A258432e7227367499E785C3532b50271"
    // ,"0x2d922712f5e99428c65b44f09Ea389373d185bB3"
    // ,"0x0565ac44e5119a3224b897De761a46A92aA28ae8"
    // ,"0xdb7F262237Ad8acca8922aA2c693a34D0d13e8fe" // 15"
    // ,"0x1b63532CcB1FeE0595c7fe2Cb35cFD70ddF862Cd"
    // ,"0xF59536290906F204C3c7918D40C1Cc5f99643d0B"
    // ,"0xA507D9d28bbca54cBCfFad4BB770C2EA0519F4F0"
    // ,"0xf26BC97Aa8AFE176e275Cf3b08c363f09De371fA"
    // ,"0xD0ec99E99cE22f2487283A087614AEe37F6B1283" // 20"
    // ,"0xB7A5a84Ff90e8Ef91250fB56c50a7bB92a6306EE"
    // ,"0x148fF761D16632da89F3D30eF3dFE34bc50CA765"
    // ,"0xCDE7185B5C3Ed9eA68605a960F6653AA1a5b5C6C"
    // ,"0xE67dad99c44547B54367E3e60fc251fC45a145C6"
    // ,"0xC7f60C2b1DBDfd511685501EDEb05C4194D67018" // 25"
    // ,"0x1cB5BF4Be53eb141B56f7E4Bb36345a353B5488c"
    // ,"0xFb9F3fa2502d01d43167A0A6E80bE03171DF407E"
    // ,"0x59D190e8A2583C67E62eEc8dA5EA7f050d8BF27e"
    // ,"0xD3540bCD9c2819771F9D765Edc189cBD915FEAbd"
    // ,"0x7F5B230Dc580d1e67DF6eD30dEe82684dD113D1F"
    // // 17 B
    ,"0xE0B5E6F32d657e0e18d4B3E801EBC76a5959e123"
];

const wrapper="0x8045561C7859713072C48Dd4c87388722fEAD9AE";

let wrapper_contract=null
var state = {
  address: false,
  unwrap:false,
  selected:null,
  tokens: {
    unwrapped: {

    },
    wrapped: {

    }
  },
  contractInstances:{

  }
}

window.addEventListener("load", async () => {
  addEventHandlers();
  let connected=await connectweb3();
  if(connected){
    document.getElementById("balance").innerText="Loading your cards..."
    await fetchTokens();
    await filterCards()
    document.getElementById("balance").innerText="Select a card to wrap/unwrap"
    setInterval(() => {
      fetchTokens();
    }, 15000);
  }
});


async function toggleWrap(){
  let wrap_btn=document.getElementById("wrap-btn");
  state.unwrap=!state.unwrap
  let text = state.unwrap ? "UNWRAP" : "WRAP"
  wrap_btn.innerText=text
  filterCards()
  displayBalance(state.selected)
  let name= state.selected==172 ? "17B" : state.selected 
  document.getElementById("amount_label").innerText= state.unwrap ? "Cards to unwrap" : "Cards to wrap";
  document.getElementById("selected-card").innerText= state.unwrap ? `Wrapped #${name}`:`Native #${state.selected}`;
  document.getElementById("to_name").innerText= state.unwrap ? `Native #${name}`:`Wrapped #${state.selected}`;
}

async function connectweb3() {
  if (window.ethereum) {
    try {
      let accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0]
      state.address = account

      console.log(`Authenticated with ${account}`)
      document.querySelector("#wallet-connection").innerHTML = `0${account.charAt(1) + account.charAt(2) + account.charAt(3) + account.charAt(4)}...${account.substr(-4)}`
      document.querySelector("#wallet-connection").setAttribute('onclick', '')

    } catch (error) {
      Swal.fire(
        'Error loading web3',
        'Please try again, use a different browser, and make sure you have web3 installed and make sure to connect metamask with this site if it prompts you to.',
        'error'
      );
      // alert('Failed to use web3, please install Metamask.');
      console.error(error);
      return false;
    }
  } else {
    console.log("Must install MetaMask");
    Swal.fire(
      'web3 was not found',
      'Please install metamask to use the site',
      'error'
    );
    return false;
  }
  return true;
}

async function filterCards(){
  let unwrappedCards=document.getElementsByClassName("card-selection")
  for(item of unwrappedCards){
    let id=item.dataset.id;
    if(!state.unwrap){
      if(!state.tokens.unwrapped[id] || state.tokens.unwrapped[id]==0){
        item.style.display='none'
      }
      else{
        item.style.display='flex'
      }
      item.innerText=`Native #${id==172?"17B":id}`
    }
    else{
      if(!state.tokens.wrapped[id] || state.tokens.wrapped[id]==0){
        item.style.display='none'
      }
      else{
        item.style.display='flex'
      }
      item.innerText=`Wrapped #${id==172?"17B":id}`
    }
  }
}
async function displayBalance(id){
  let balance_element=document.getElementById("balance");
  let amount=document.getElementById("amount");
  if(!state.unwrap){
    let bal= state.tokens.unwrapped[id] ? state.tokens.unwrapped[id] : "?"
    balance_element.innerText=`Your Native #${id==172?"17B":id} cards: ${bal}`
    amount.value=bal;
  }
  else{
    let bal= state.tokens.wrapped[id] ? state.tokens.wrapped[id] : "?"
    balance_element.innerText=`Your Wrapped #${id==172?"17B":id} cards: ${bal}`
    amount.value=bal;
  }
}

async function onSelectCard(ev){
  let id=ev.target.dataset.id;
  state.selected=id;
  if(ev.target.parentElement.style.display!="none"){
      // wrapping vs unwrapping
    if(!state.unwrap){
        if(!ev.target.dataset.name){
            document.getElementById("selected-card").innerText=`Native #${id}`;
            document.getElementById("to_name").innerText=`Wrapped #${id}`;
        }
        else{
            let name=ev.target.dataset.name
            document.getElementById("selected-card").innerText=`Native #${name}`;
            document.getElementById("to_name").innerText=`Wrapped #${name}`;
        }
        document.getElementById("amount").setAttribute("max",state.tokens.unwrapped[state.selected])
    }else{
      if(!ev.target.dataset.name){
            document.getElementById("selected-card").innerText=`Wrapped #${id}`;
            document.getElementById("to_name").innerText=`Native #${id}`;
        }
        else{
            let name=ev.target.dataset.name
            document.getElementById("selected-card").innerText=`Wrapped #${name}`;
            document.getElementById("to_name").innerText=`Native #${name}`;
        }
        document.getElementById("amount").setAttribute("max",state.tokens.wrapped[state.selected])
    }   
    
  }
  displayBalance(id)
}

async function addEventHandlers(){
  let unwrappedCards=document.getElementsByClassName("card-selection")
  let wrap_toggle=document.getElementById("wrap-toggle")
  let wrap_btn=document.getElementById("wrap-btn")
  for(item of unwrappedCards){
    item.addEventListener("click",onSelectCard);
  }
  wrap_toggle.addEventListener("click",toggleWrap)
  wrap_btn.addEventListener("click",wrap_or_unwrap)
}

async function wrap_or_unwrap(){
  let amount=document.getElementById("amount").value
  let amount_val=parseInt(amount);
  let maxAmount = (!state.unwrap) ? state.tokens.unwrapped[state.selected] : state.tokens.wrapped[state.selected];
  if(isNaN(amount_val)||amount_val==0||amount_val>maxAmount){
    Swal.fire(
    'Error',
    'Please check the amount of cards to make sure its valid and you have enough',
    'error'
    ); 
    return;
  }
  if(!state.selected){
    Swal.fire(
    'Error',
    'Please select a card before unwrapping/wrapping',
    'error'
    ); 
    return;
  }
  if(!state.address){
    Swal.fire(
    'Error',
    'Please link metamask before unwrapping/wraping',
    'error'
    ); 
    return;
  }
  if(state.address && state.selected){
    if(!state.unwrap){
      let selectedContract=state.contractInstances[state.selected];
      let allowance=await selectedContract.methods.allowance(state.address,wrapper).call()
      let allowance_val=parseInt(allowance);
      if(allowance_val<amount_val){
        Swal.fire(
        'Approve Transfer',
        'Please approve the card transfer to the wrapper contract',
        'info'
        );
        try{
          await selectedContract.methods.approve(wrapper,"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({from:state.address})
        }
        catch(e){
          Swal.fire(
          'Approval Transaction Failed',
          'The transaction failed or was cancelled, please try again and refresh the page to make sure the transaction actually failed.',
          'error'
          );
          return
        }
      }
      Swal.fire(
      'Confirm Wrap',
      'Please confirm the wrap in metamask',
      'info'
      );
      try{
        await wrapper_contract.methods.wrap(state.selected,amount).send({from:state.address})
      }
      catch(e){
        Swal.fire(
        'Wrap Transaction Failed',
        'The transaction failed or was canceled , please try again',
        'error'
        );
        return
      }
    }
    else{
      Swal.fire(
      'Confirm Unwrap',
      'Please confirm the unwrap in metamask',
      'info'
      );
      try{
        await wrapper_contract.methods.unwrap(state.selected,amount).send({from:state.address})
      }
      catch(e){
        Swal.fire(
        'Unwrap Transaction Failed',
        'The transaction failed or was canceled , please try again',
        'error'
        );
        return
      }
    }
  }
}
async function fetchTokens() {
  if (!state.address) return;

    const wrapper_abi=[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_operator","type":"address"},{"indexed":false,"internalType":"bool","name":"_approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_operator","type":"address"},{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"_ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"_values","type":"uint256[]"}],"name":"TransferBatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_operator","type":"address"},{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_id","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"TransferSingle","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"_value","type":"string"},{"indexed":true,"internalType":"uint256","name":"_id","type":"uint256"}],"name":"URI","type":"event"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"_owners","type":"address[]"},{"internalType":"uint256[]","name":"_ids","type":"uint256[]"}],"name":"balanceOfBatch","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256[]","name":"_ids","type":"uint256[]"},{"internalType":"uint256[]","name":"_values","type":"uint256[]"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeBatchTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"uint256","name":"_value","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_operator","type":"address"},{"internalType":"bool","name":"_approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_uri","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"_interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"unwrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"wrap","outputs":[],"stateMutability":"nonpayable","type":"function"}]

  if(!wrapper_contract){
    wrapper_contract =  await new web3.eth.Contract(wrapper_abi,wrapper)
  }

  const abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"standard","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"description","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"target","type":"address"},{"name":"mintedAmount","type":"uint256"}],"name":"mintToken","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"ipfs_hash","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"desc","type":"string"}],"name":"setDescription","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"isLocked","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"lock","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"initialSupply","type":"uint256"},{"name":"tokenName","type":"string"},{"name":"tokenSymbol","type":"string"},{"name":"tokenDescription","type":"string"},{"name":"ipfsHash","type":"string"}],"payable":false,"type":"constructor"},{"payable":false,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]


  // Gets all balances
  for(let i=0;i<1;i++){
    if(!state.contractInstances[i+1]){
      let contractInstance=await new web3.eth.Contract(abi, contracts[i]);
      state.contractInstances[i+1]=contractInstance

    }
    try{
      let balance=await state.contractInstances[i+1].methods.balanceOf(state.address).call()
      console.log(balance)
      state.tokens.unwrapped[i+1] = balance
    }
    catch(e){
      console.log(e)
      state.tokens.unwrapped[i+1] = 0
    }
    try{
      let balance_wrapped = await wrapper_contract.methods.balanceOf(state.address,i+1).call()
      state.tokens.wrapped[i+1] = balance_wrapped
    }
    catch(e){
      console.log(e)
      state.tokens.wrapped[i+1] = 0
    }

   
  }
  let contractInstance=await new web3.eth.Contract(abi, contracts[30]);
    state.contractInstances[172]=contractInstance
    try{
      let balance = await contractInstance.methods.balanceOf(state.address).call()
      state.tokens.unwrapped[172] = balance
    }
    catch(e){
      console.log(e)
      state.tokens.unwrapped[172] = 0
    }   
    try{
      let balance_wrapped_17b = await wrapper_contract.methods.balanceOf(state.address,172).call()
      state.tokens.wrapped[172] = balance_wrapped_17b
    }
    catch(e){
      console.log(e)
      state.tokens.wrapped[172] = 0
    }  
   

  if(state.selected){
    displayBalance(state.selected)
  }
}