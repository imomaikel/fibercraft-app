'use server';
import { redirect } from 'next/navigation';

const ManagementPage = async () => {
  redirect('/dashboard');
};

export default ManagementPage;
