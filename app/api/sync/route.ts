import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

// Converts the old callback-based exec into a modern Promise
const execPromise = util.promisify(exec);

export async function POST() {
  try {
    // Executes the exact command you were typing into the terminal
    const { stdout, stderr } = await execPromise('python3 backend/cause_list_parser.py');
    
    return NextResponse.json({ success: true, output: stdout });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}