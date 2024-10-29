import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Cards from '../components/Cards/cards';
import { Modal } from 'antd';
import AddExpenseModals from '../components/Modal/addExpense';
import AddIncomeModals from '../components/Modal/addIncome';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import moment from "moment";
import TransactionsTable from '../components/TransactionsTable';

function Dashboard() {
   // const transaction =[
    //   {
        //type:"income",
        // amount:1200,
        //tag:"salary",
        //name:"income 1",
        //date:"2024-05-18",
        //},
    //{
        // type:"expense",
        //amount:800,
        //tag:"salary",
        //name:"expense 1",
        //date:"2024-05-18",
    // },
     //];

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user] = useAuthState(auth)
    const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
    const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);


    const [income , setIncome ] = useState(0);
    const [expense , setExpense ] = useState(0);
    const [totalBalance, SetTotalBalance] = useState(0);
    


  const showExpenseModal = () => {
    setIsExpenseModalVisible(true);
  };

  const showIncomeModal= () => {
    setIsIncomeModalVisible(true);
  };

  const handleExpenseCancel = () => {
    setIsExpenseModalVisible(false);
  };

  const handleIncomeCancel = () => {
    setIsIncomeModalVisible(false);
  };


  const onFinish = (values, type) =>    {
    const newTransaction = {
      type: type,
      date: values.date.format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };
    console.log("new Transaction", newTransaction);
    addTransaction(newTransaction);
    
  };

  async function addTransaction(transaction, many) {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      
      console.log("Document written with ID: ", docRef.id);

       if(!many) toast.success("Transaction Added!");
        let newArr =transactions;
        newArr.push(transaction);
        setTransactions(newArr);
        calculateBalance();

    } catch (e) {
      console.error("Error adding document: ", e);
      if(!many)  toast.error("Couldn't add transaction");
      
    }
  }

  

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      let transactionsArray = [];
      querySnapshot.forEach((doc) => {
        transactionsArray.push(doc.data());
      });
      setTransactions(transactionsArray);
      calculateBalance(); // Run calculateBalance after setting transactions
      toast.success("Transactions Fetched!");
    }
    setLoading(false);
  }
  
  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;
  
    transactions?.forEach((transaction) => {
      if (transaction.type === "income") {
        incomeTotal += transaction.amount;
      } else if (transaction.type === "expense") {
        expensesTotal += transaction.amount;
      }
    });
  
    setIncome(incomeTotal);
    setExpense(expensesTotal);
    SetTotalBalance(incomeTotal - expensesTotal);
  };
  

  useEffect(() =>{
    calculateBalance();
  },  [transactions] );

  useEffect(() => {
    // Get all Doc from collection
    fetchTransactions();
  },[user]);

 
 
    return <div>
        <Header/>
        {loading? (
            <p>
                Loading...!
            </p>
        ):(
            <>
        
        <Cards 
        income={income}
        expense={expense}
        totalBalance={totalBalance}
        showExpenseModal ={showExpenseModal}
        showIncomeModal  ={showIncomeModal}
        />

        
        <AddExpenseModals
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModals
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />
          <TransactionsTable 
          transactions={transactions} 
          addTransaction={addTransaction}
          fetchTransactions={fetchTransactions}
          />
          </>
          )
        }

    </div>
}

export default Dashboard;