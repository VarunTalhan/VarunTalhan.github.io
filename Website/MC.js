const loanAmountInput = document.querySelector(".loan-amount");
const interestRateInput = document.querySelector(".interest-rate");
const loanTenureInput = document.querySelector(".loan-tenure");
const MIInput = document.querySelector(".MI");

const loanEMIValue = document.querySelector(".loan-emi .value");
const totalInterestValue = document.querySelector(".total-interest .value");
const totalAmountValue = document.querySelector(".total-amount .value");
const totalEligableValue = document.querySelector(".Eligable .value");

const calculateBtn = document.querySelector(".calculate-btn");

let loanAmount, interestRate, loanTenure, MI, interest;

// Function to check if all input fields have values
const checkValues = () => {
  return (
    loanAmountInput.value !== "" &&
    interestRateInput.value !== "" &&
    loanTenureInput.value !== "" &&
    MIInput.value !== ""
  );
};

// Function to refresh input values and calculate interest
const refreshInputValues = () => {
  loanAmount = parseFloat(loanAmountInput.value);
  interestRate = parseFloat(interestRateInput.value);
  loanTenure = parseFloat(loanTenureInput.value);
  MI = parseFloat(MIInput.value);
  interest = interestRate / 12 / 100;
};

// Function to calculate EMI
const calculateEMI = () => {
  refreshInputValues();
  let emi =
    loanAmount *
    interest *
    (Math.pow(1 + interest, loanTenure) /
      (Math.pow(1 + interest, loanTenure) - 1));
  return emi;
};

// Function to update the displayed data
const updateData = (emi, result) => {
  loanEMIValue.innerHTML = Math.round(emi);

  let totalAmount = Math.round(loanTenure * emi);
  totalAmountValue.innerHTML = totalAmount;

  let totalInterestPayable = Math.round(totalAmount - loanAmount);
  totalInterestValue.innerHTML = totalInterestPayable;

  totalEligableValue.innerHTML = result;
};

// Function to check eligibility
const check = (emi) => {
  let Threshhold = 0.3 * MI;
  let result;
  if (emi >= Threshhold) {
    result = "Not Eligible";
  } else {
    result = "Eligible";
  }
  return result;
};

// Main function to run the calculation and update the UI
const init = () => {
  if (checkValues()) {
    let emi = calculateEMI();
    let result = check(emi);
    updateData(emi, result);
  } else {
    alert("Please fill in all input fields");
  }
};

// Add event listener for the calculate button
calculateBtn.addEventListener("click", init);
