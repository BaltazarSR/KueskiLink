import { Route } from 'react-router-dom'
import OwnerDashboard from '../dashboard/OwnerDashboard'
import EmployeeDashboard from '../dashboard/EmployeeDashboard'
import CreateLink from '../links/CreateLink'
import PrivateRoute from '../auth/PrivateRoute'
import Profile from '../profile/Profile'
import Options from '../menu/Options'
import Notifications from '../menu/Notifications'
import PaymentHistory from '../menu/PaymentHistory'
import LinkHistory from '../menu/LinkHistory'
import Products from '../menu/Products'
import AddProduct from '../menu/AddProduct'
import Employees from '../menu/Employees'
import Help from '../menu/Help'
import AddEmployee from '../menu/AddEmployee'
import SendLink from '../links/SendLink'
import EditProfile from '../profile/EditProfile'
import EditBusiness from '../profile/EditBusiness'
import EditPassword from '../profile/EditPassword'
import DisableAccount from '../profile/DisableAccount'
import EmployeeInfo from '../menu/EmployeeInfo'
import InvitationInfo from '../menu/InvitationInfo'
import SendEmployeeInvitation from '../menu/SendEmployeeInvitation'
import EmployeeInactive from '../pages/EmployeeInactive'
import ProductInfo from '../menu/ProductInfo'
import LinkInfo from '../menu/LinkInfo'
import Stats from '../pages/Stats'
import StatsProduct from '../pages/StatsProduct'

export default (
  <>
    {/* 🔐 Bloque exclusivo para Owners */}
    <Route element={<PrivateRoute allowedRoles={['owner']} />} key="owner-protected">
      <Route path="/admin" element={<OwnerDashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/add-employee" element={<AddEmployee />} />
      <Route path="/edit-business" element={<EditBusiness />} />
      <Route path="/employee-info/:id" element={<EmployeeInfo />} />
      <Route path="/invitation-info/:id" element={<InvitationInfo />} />
      <Route path="/send-invitation" element={<SendEmployeeInvitation />} />
      <Route path="/product-info/:id" element={<ProductInfo />} />
      <Route path="/stats" element={<Stats/>} />
      <Route path="/stats-product/:id" element={<StatsProduct/>} />
    </Route>

    {/* 🔐 Bloque exclusivo para Empleados */}
    <Route element={<PrivateRoute allowedRoles={['employee']} />} key="employee-protected">
      <Route path="/employee" element={<EmployeeDashboard />} />
    </Route>

    {/* 👥 Rutas compartidas entre Owner y Employee */}
    <Route element={<PrivateRoute allowedRoles={['owner', 'employee']} />} key="shared-protected">
      <Route path="/profile" element={<Profile />} />
      <Route path="/options" element={<Options />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/payment-history" element={<PaymentHistory />} />
      <Route path="/link-history" element={<LinkHistory />} />
      <Route path="/help" element={<Help />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/edit-password" element={<EditPassword />} />
      <Route path="/disable-account" element={<DisableAccount />} />
      <Route path="/create-link" element={<CreateLink />} />
      <Route path="/send-link" element={<SendLink />} />
      <Route path="/link-info/:id" element={<LinkInfo />} />
    </Route>

    <Route path="/employee-inactive" element={<EmployeeInactive />} />
  </>
)
