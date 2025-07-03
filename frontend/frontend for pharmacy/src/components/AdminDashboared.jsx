import { useState, useEffect, useRef } from 'react';
import style from './AdminDashboared.module.css';
import ListAllProduct from './ListAllProduct';
import TransferManagment from './TransferManagement';
import ApproveTransfer from './ApproveTransfer';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import BinCardStockCard from './BinCardStockCard';
import ExpiringProducts from './ExpiringProducts';
import DamagedProducts from './DamagedProducts';
import StockOuts from './StockOuts';
import { useNavigate } from 'react-router-dom';
import ListAllSupplier from './Supplier_components/ListAllSupplier';
import AddSupplier from './Supplier_components/AddSupplier';
import EditSupplier from './Supplier_components/EditSupplier';
import RefillProduct from './RefillProduct';
import SearchByInv from './SearchByInv';
import Logout from './User_Components/Logout';
import ListUser from './User_Components/ListUser';
import AddUser from './User_Components/AddUser';
import EditProfile from './User_Components/EditProfile';
import SetUserRole from './User_Components/SetUserRole';
import ManageUsers from './User_Components/ManageUsers';
import ListEntity from './Entity_components/ListEntity';
import AddEntity from './Entity_components/AddEntity';
import EditEntity from './Entity_components/EditEntity';
import ListStore from './Store_components/ListStores';
import AddStore from './Store_components/AddStore';
import EditStore from './Store_components/EditStore';
import Sale from './Sale_Components/Sale';
import Prescription from './Sale_Components/Prescription';
import SaleHistory from './Sale_Components/SaleHistory';
import SellCredit from './Sale_Components/SellCredit';
import ListCreditCustomer from './CreditCustomer_component/ListCreditCustomer';
import AddCreditCustomer from './CreditCustomer_component/AddCreditCustomer';
import EditCreditCustomer from './CreditCustomer_component/EditCreditCustomer';
import ReportDamagedProduct from './ReportDamagedProduct';
import ManageCreditCustomer from './CreditCustomer_component/ManageCreditCustomer';
import CreditSaleHistory from './Sale_Components/CreditSaleHistory';
import ManageCreditSells from './Sale_Components/ManageCreditSells';
import ManageSaleHistory from './Sale_Components/ManageSaleHistory';
import ListDeletedSaleHistory from './Sale_Components/ListDeletedSaleHistory';
import TransferReport from './TransferReport';
import EditBrand from './EditBrand';
import BrandsWithQuantity from './BrandsWithQuantity';

function AdminDashboared() {
  const [expanded, setExpanded] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setExpanded(prev => prev === section ? null : section);
  };

  const handleComponentSwitch = (component) => {
    setActiveComponent(component);
    setExpanded(null);
  };

  const handleOutsideClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setExpanded(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className={style.container}>
      <header className={style.header}>
        <h1 className={style.title} onClick={() => window.location.reload()}>Ayu Pharmacy</h1>
        <div className={style.orgName}>Ayu Health Organization</div>
      </header>

      <nav className={style.navbar} ref={menuRef}>
        <ul className={style.menu}>
          <li className={style.menuItem} onMouseEnter={() => toggleSection("products")}>Products
            <ul className={`${style.submenu} ${expanded === "products" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("add")}>Add</li>
              <li onClick={() => handleComponentSwitch("refillProduct")}>Refill</li>
              <li onClick={() => handleComponentSwitch("edit")}>Edit Product</li>
              <li onClick={() => handleComponentSwitch("editBrand")}>Edit Brand</li>
              <li onClick={() => handleComponentSwitch("binCard")}>Bin Card</li>
              <li onClick={() => handleComponentSwitch("filter")}>Filter Products</li>
              <li onClick={() => handleComponentSwitch("transfer")}>Transfer</li>
              <li onClick={() => handleComponentSwitch("TransferReport")}>Transfer Report</li>
              <li onClick={() => handleComponentSwitch("approveTransfer")}>Approve Transfer</li>
              <li onClick={() => handleComponentSwitch("expiring")}>Expiring</li>
              <li onClick={() => handleComponentSwitch("damaged")}>List Damaged</li>
              <li onClick={() => handleComponentSwitch("reportDamaged")}>Report Damaged</li>
              <li onClick={() => handleComponentSwitch("stockOut")}>Stock Outs</li>
              <li onClick={() => handleComponentSwitch("searchByInv")}>Search by Invoice</li>
              <li onClick={() => handleComponentSwitch("brandWithQuantity")}>Brands with Quantity</li>
            </ul>
          </li>

          <li className={style.menuItem} onMouseEnter={() => toggleSection("supplier")}>Supplier
            <ul className={`${style.submenu} ${expanded === "supplier" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("listSupplier")}>List</li>
              <li onClick={() => handleComponentSwitch("addSupplier")}>Add</li>
              <li onClick={() => handleComponentSwitch("editSupplier")}>Edit</li>
            </ul>
          </li>

          <li className={style.menuItem} onMouseEnter={() => toggleSection("user")}>User
            <ul className={`${style.submenu} ${expanded === "user" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("listUser")}>List</li>
              <li onClick={() => handleComponentSwitch("addUser")}>Add</li>
              <li onClick={() => handleComponentSwitch("editProfile")}>Edit</li>
              <li onClick={() => handleComponentSwitch("manageUsers")}>Manage Users</li>
              <li onClick={() => handleComponentSwitch("logOut")}>Logout</li>
            </ul>
          </li>

          <li className={style.menuItem} onMouseEnter={() => toggleSection("credit")}>Credit Customers
            <ul className={`${style.submenu} ${expanded === "credit" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("listCreditCustomer")}>List</li>
              <li onClick={() => handleComponentSwitch("addCreditCustomer")}>Add</li>
              <li onClick={() => handleComponentSwitch("editCreditCustomer")}>Edit</li>
              <li onClick={() => handleComponentSwitch("banCreditCustomer")}>ManageCreditCustomer</li>
            </ul>
          </li>

          <li className={style.menuItem} onMouseEnter={() => toggleSection("entity")}>Entity
            <ul className={`${style.submenu} ${expanded === "entity" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("listEntity")} >List</li>
              <li onClick={() => handleComponentSwitch("addEntity")}>Add</li>
              <li onClick={() => handleComponentSwitch("editEntity")} >Edit</li>  
            </ul>
          </li>

          <li className={style.menuItem} onMouseEnter={() => toggleSection("store")}>Store
            <ul className={`${style.submenu} ${expanded === "store" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("listStore")}>List</li>
              <li onClick={() => handleComponentSwitch("addStore")}>Add</li>
              <li onClick={() => handleComponentSwitch("editStore")}>Edit</li>
            </ul>
          </li>

          <li className={style.menuItem} onMouseEnter={() => toggleSection("sales")}>Sales
            <ul className={`${style.submenu} ${expanded === "sales" ? style.show : ""}`}>
              <li onClick={() => handleComponentSwitch("sale")}>Sale</li>
              <li onClick={() => handleComponentSwitch("prescription")}>Prescription</li>
              <li onClick={() => handleComponentSwitch("saleHistory")}>Sale History</li>
              <li onClick={() => handleComponentSwitch("manageSaleHistory")}>Manage Sale History</li>
              <li onClick={() => handleComponentSwitch("sellCredit")}>Sell Credit</li>
              <li onClick={() => handleComponentSwitch("creditSellHistory")}>Credit sell History</li>
              <li onClick={() => handleComponentSwitch("manageCreditSells")}>Manage Credit sell History</li>
              <li onClick={() => handleComponentSwitch("listDeletedSaleHistory")}>List deleted saleHistory</li>
            </ul>
          </li>
        </ul>
      </nav>

      <main className={style.mainContent}>
        {activeComponent === "add" && <AddProduct />}
        {activeComponent === "edit" && <EditProduct />}
        {activeComponent === "binCard" && <BinCardStockCard />}
        {activeComponent === "filter" && <ListAllProduct />}
        {activeComponent === "transfer" && <TransferManagment />}
        {activeComponent === "expiring" && <ExpiringProducts />}
        {activeComponent === "damaged" && <DamagedProducts />}
        {activeComponent === "stockOut" && <StockOuts />}
        {activeComponent === "searchByInv" && <SearchByInv />}
        {activeComponent === "approveTransfer" && <ApproveTransfer />}
        {activeComponent === "listSupplier" && <ListAllSupplier />}
        {activeComponent === "addSupplier" && <AddSupplier />}
        {activeComponent === "editSupplier" && <EditSupplier />}
        {activeComponent === "refillProduct" && <RefillProduct />}
        {activeComponent === "logOut" && <Logout />}
        {activeComponent === "listUser" && <ListUser/>}
        {activeComponent === "addUser" && <AddUser/>}
        {activeComponent === "editProfile" && <EditProfile/>}
        {activeComponent === "manageUsers" && <ManageUsers/>}
        {activeComponent === "listEntity" && <ListEntity/>}
        {activeComponent === "addEntity" && <AddEntity/>}
        {activeComponent === "editEntity" && <EditEntity/>}
        {activeComponent === "listStore" && <ListStore/>}
        {activeComponent === "addStore" && <AddStore/>}
        {activeComponent === "editStore" && <EditStore/>}
        {activeComponent === "sale" && <Sale/>}
        {activeComponent === "prescription" && <Prescription/>}
        {activeComponent === "saleHistory" && <SaleHistory/>}
        {activeComponent === "sellCredit" && <SellCredit/>}
        {activeComponent === "listCreditCustomer" && <ListCreditCustomer/>}
        {activeComponent === "addCreditCustomer" && <AddCreditCustomer/>}
        {activeComponent === "editCreditCustomer" && <EditCreditCustomer/>}
        {activeComponent === "banCreditCustomer" && <ManageCreditCustomer/>}
        {activeComponent === "reportDamaged" && <ReportDamagedProduct/>}
        {activeComponent === "creditSellHistory" && <CreditSaleHistory/>}
        {activeComponent === "manageCreditSells" && <ManageCreditSells/>}
        {activeComponent === "manageSaleHistory" && <ManageSaleHistory/>}
        {activeComponent === "listDeletedSaleHistory" && <ListDeletedSaleHistory/>}
        {activeComponent === "TransferReport" && <TransferReport/>}
        {activeComponent === "editBrand" && <EditBrand/>}
        {activeComponent === "brandWithQuantity" && <BrandsWithQuantity/>}
      </main>

      <footer className={style.footer}>
        &copy; {new Date().getFullYear()} Ayu Health Organization. All rights reserved.
      </footer>
    </div>
  );
}

export default AdminDashboared;
