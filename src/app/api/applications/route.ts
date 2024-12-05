import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const application = await prisma.application.create({
      data: {
        application: uuidv4(),
        name: data.name,
        details: data.details || null,
        metadata: data.metadata || {},
        userId: session.user.id,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
} 