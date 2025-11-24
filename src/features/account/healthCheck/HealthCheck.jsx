import React from 'react'
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';

const HealthCheck = () => {
  return (
    <section>
      <Header />
      <Sidebar />
      <div className="pl-[300px]">HealthCheck page</div>
    </section>
  );
}

export default HealthCheck