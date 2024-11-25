import { NextResponse } from 'next/server';
import { tenantOperations, queryUtils } from '@/lib/db-utils';
import { auth } from '@/app/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTenants = await queryUtils.getUserTenants(session.user.id);
    return NextResponse.json(userTenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const tenant = await tenantOperations.createTenant(data);
    
    // Automatically add creating user to tenant
    await userOperations.addUserToTenant(session.user.id, tenant.id);

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}