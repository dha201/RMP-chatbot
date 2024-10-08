import { NextRequest, NextResponse } from 'next/server';
import { connectToChatDB } from '@/app/lib/mongodb-client-chat';
import { MongoClient, ServerApiVersion } from 'mongodb';


const uri = process.env.MONGODB_URI || '';

export async function POST(req: NextRequest) {
  try {

    const startTime = Date.now();

    // Parse the JSON body of the request
    const { session_id, user_id, plan } = await req.json();

    console.log("Payment success for user:", user_id);
    console.log("Plan purchased:", plan);
    console.log("Session payment status:", session_id);

    if (!session_id || !user_id || !plan) {
      return NextResponse.json({ error: 'Missing session_id, user_id, or plan' }, { status: 400 });
    }

    // Retrieve the session to verify the payment was successful
    /* const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    } */

    // Connect to the database
    // const db = await connectToChatDB();
    // const userLimitsCollection = db.collection('userLimits');

    const startConnectionTime = Date.now(); // Start timing the connection
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    const endConnectionTime = Date.now();
    console.log(`MongoDB connection established in ${endConnectionTime - startConnectionTime} ms`);

    const db = client.db("chatbotDB");
    const userLimitsCollection = db.collection('userLimits');

    // Determine the new character limit based on the plan
    let newCharacterLimit = 10000; // Default for starter plan
    if (plan === 'pro') {
      newCharacterLimit = 1000000; // 1 million characters for pro plan
    }

    // Update the user's character limit in the database
    const startUpdateTime = Date.now();
    await userLimitsCollection.updateOne(
      { userId: user_id },
      { $set: { characterLimit: newCharacterLimit } }
    );
    const endUpdateTime = Date.now();

    console.log(`Character limit updated to ${newCharacterLimit} for userId: ${user_id}`);
    console.log(`MongoDB updateOne operation took ${endUpdateTime - startUpdateTime} ms`);

    const endTime = Date.now(); 
    console.log(`Total request processing time: ${endTime - startTime} ms`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in payment success handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
