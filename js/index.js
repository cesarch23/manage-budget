//variables
const formulario = document.querySelector('#add-budget')
const gastoListado = document.querySelector('#budget ul')

//events
eventListerners();
function eventListerners(){
    document.addEventListener('DOMContentLoaded',askBudget);
    formulario.addEventListener('submit',addBudget)
    gastoListado.addEventListener('click',deleteElement)
}
// class
class Budget {
    constructor(value){
        this.budget = Number(value);
        this.residual = Number(value);
        this.bills = [];
    }
    addBills(expense){
        this.bills = [...this.bills,expense];
    }
    isValidBudget(expense){
        const residuo = this.calcResidual(expense);
        if(residuo<0) return false;
        this.residual = residuo;
        return true;
    }
    calcResidual(expense){
        const totalExpense = this.bills.reduce((acumulate,spent)=>acumulate+spent.quantity,0)
        const residuo = this.budget - totalExpense - expense.quantity;
        return residuo;
    }
    updateResidual(residuo){
        this.residual = residuo
    }
    updateBills(newBills){
        this.bills = [...newBills]
    }
    getCurrentResidual(){
        const totalExpense = this.bills.reduce((acumulate,spent)=>acumulate+spent.quantity,0)
        const residuo = this.budget - totalExpense;
        return residuo;
    }

}
class UI {
    insertBudget(values){
        const {budget, residual} = values;
        document.querySelector('#total').textContent = budget;
        document.querySelector('#residual').textContent = residual;
    }
    showAlert(message,tipo){
        const divMessage = document.createElement('P');
        divMessage.textContent = message;
        if(tipo==="error") divMessage.classList.add("alert-danger")
        if(tipo ==="success")  divMessage.classList.add("alert-success")
        formulario.appendChild(divMessage);
        setTimeout(()=>{divMessage.remove()},1500)
    }
    showBills(bills){
        this.cleanBills();
        bills.forEach(({quantity, name, id})=>{
            const newExpense = document.createElement('li');
            newExpense.className = "my-expenses__list-item"
            newExpense.dataset.id = id
            newExpense.innerHTML = `${name} <span class="my-expenses__list-item-qty"> $ ${quantity} </span>`;

            const deleteButton = document.createElement('button')
            deleteButton.classList.add("delete-button");
            deleteButton.textContent = "x"
            newExpense.appendChild(deleteButton);
            gastoListado.appendChild(newExpense);
        
        })
    }
    cleanBills(){
        gastoListado.replaceChildren()
    }
    updateResidual(){
        document.querySelector('#residual').textContent = objBudget.residual;
        this.checkAndUpdateBackgroundColor();
        if(objBudget.residual===0) formulario.querySelector('button[type="submit"]').disabled = true;
        else formulario.querySelector('button[type="submit"]').disabled = false;
    }
    checkAndUpdateBackgroundColor(){
        const residualElement = document.querySelector('.restante')
        if((objBudget.residual) <= objBudget.budget*0.25){
            residualElement.classList.remove('alert-success')
            residualElement.classList.remove('alert-warning')
            residualElement.classList.add('alert-danger')
            return;
        }
        if((objBudget.residual) <= objBudget.budget*0.50){
            residualElement.classList.remove('alert-success')
            residualElement.classList.add('alert-warning')
            return;
        }
        residualElement.classList.remove('alert-danger')
        residualElement.classList.remove('alert-warning')
        residualElement.classList.add('alert-success')
    }
}
// instancias
let objUI = new UI()
let objBudget;
//funciones 
function askBudget(){
    const userBudget = prompt('Cual es tu presupuesto?');
    
    if(userBudget === '' || 
        userBudget === null || 
        isNaN(userBudget) ||
        userBudget == 0
    )
        window.location.reload();
        
    objBudget = new Budget(userBudget)
    objUI.insertBudget({budget:userBudget,residual:userBudget})
     
}

function formIsValid(e){
    e.preventDefault();
    const name = document.querySelector('#expense').value;
    const quantity = document.querySelector('#quantity').value;
    if(name == "" || quantity =="" ) {
        objUI.showAlert("Los campos son obligatorios",'error');
        return false;
    }
    if( isNaN(quantity) || quantity <=0){
        objUI.showAlert("La cantidad debe ser un numero entero","error");
        return false;      
    } 
    return true;
   
}

function addBudget(event){
    if(!formIsValid(event)) return;
    const name = document.querySelector('#expense').value;
    const quantity = document.querySelector('#quantity').value;
    const quantityNumb = Number(quantity)
    const spent = {name,quantity: quantityNumb, id:Date.now()} 
   
    if(objBudget.isValidBudget(spent)){
        objBudget.addBills(spent)
        objUI.updateResidual(spent)
        const { bills } = objBudget;
        objUI.showBills(bills)
        objUI.showAlert("Se agrego el gasto","success")
        formulario.reset()
        return;
    } 
    objUI.showAlert("La cantidad ingresada supera el presupuesto","error")
}

function deleteElement(event){
    if(event.target.className.includes('delete-button')){
        const id = event.target.parentElement.getAttribute('data-id');
        const newBills = objBudget.bills.filter(expense=>expense.id != id)
        objBudget.updateBills(newBills)
        objBudget.updateResidual(objBudget.getCurrentResidual()) 
        objUI.updateResidual();
        event.target.parentElement.remove()
    }

}
