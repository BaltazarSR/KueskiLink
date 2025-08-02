// src/routes/PublicRoutes.jsx
import { Route } from 'react-router-dom'
import Login from '../auth/Login'
import HomeRedirect from '../pages/HomeRedirect'
import Register from '../auth/Register'
import VerifyEmail from '../auth/VerifyEmail'
import CompleteProfile from '../auth/CompleteProfile'
import ClientPay from '../links/ClientPay'
import CashConfirmation from '../links/CashConfirmation'
import NotFound from '../pages/NotFound'
import Success from '../payment/Success'
import Reject from '../payment/Reject'
import Canceled from '../payment/Canceled'
import Failed from '../payment/Failed'

export default [
    <Route path="/" element={<HomeRedirect />} key="home" />,
    <Route path="/login" element={<Login />} key="login" />,
    <Route path="/register" element={<Register />} />,
    <Route path="/verify-email" element={<VerifyEmail />} />,
    <Route path="/complete-profile" element={<CompleteProfile />} />,
    <Route path="/client-pay/:id" element={<ClientPay />} />,
    <Route path="/cash-confirmation" element={<CashConfirmation />} />,
    <Route path="*" element={<NotFound />} key="not-found" />,
    <Route path="success" element={<Success />} key="success" />,
    <Route path="reject" element={<Reject />} key="reject" />,
    <Route path="canceled" element={<Canceled />} key="canceled" />,
    <Route path="failed" element={<Failed />} key="failed" />
  ]

