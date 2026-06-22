import React from 'react';
import { Outlet } from 'react-router-dom';
import ManageSideBar from './ManageSideBar';

export default function OwnerManageLayout() {
  return (
    <>
      <ManageSideBar />
      <Outlet />
    </>
  );
}
