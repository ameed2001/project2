'use server';

import nodemailer from 'nodemailer';

export interface EmailTestResult {
  success: boolean;
  message: string;
  configuredVars: string[];
  missingVars: string[];
}

const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];

export async function testEmailSettingsAction(): Promise<EmailTestResult> {
  const configuredVars: string[] = [];
  const missingVars: string[] = [];

  for (const v of requiredEnvVars) {
    if (process.env[v]) {
      configuredVars.push(v);
    } else {
      missingVars.push(v);
    }
  }

  // Also check for EMAIL_FROM_ADDRESS but don't require it
  if (process.env.EMAIL_FROM_ADDRESS) {
    configuredVars.push('EMAIL_FROM_ADDRESS');
  }

  if (missingVars.length > 0) {
    return {
      success: false,
      message: `الإعدادات غير مكتملة. يرجى تعريف المتغيرات المفقودة في ملف .env.local.`,
      configuredVars,
      missingVars,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: (process.env.EMAIL_PORT === '465'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Often needed for local development or certain providers
      }
    });

    await transporter.verify();
    
    return {
      success: true,
      message: 'تم التحقق من الاتصال بخادم البريد بنجاح. يجب أن تعمل ميزة إرسال البريد الآن.',
      configuredVars,
      missingVars,
    };
  } catch (error: any) {
    console.error('[EmailTest-Action] Nodemailer verification failed:', error);
    return {
      success: false,
      message: `فشل التحقق من الاتصال. الخطأ: ${error.message}`,
      configuredVars,
      missingVars,
    };
  }
}
