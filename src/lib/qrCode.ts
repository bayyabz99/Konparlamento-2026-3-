import QRCode from 'qrcode';

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('QR code generation error:', err);
    return '';
  }
}

export function getUserQrPayload(userOrApp: any): string {
  if (!userOrApp) return '';
  return JSON.stringify({
    id: userOrApp.id,
    name: `${userOrApp.firstName || userOrApp.name || ''} ${userOrApp.lastName || ''}`.trim(),
    email: userOrApp.email || '',
    pin: userOrApp.pin || '',
    party: userOrApp.requestedParty || userOrApp.party || 'Gelecek ve İnovasyon Partisi',
    role: userOrApp.requestedRole || userOrApp.role || 'Delegasyon Üyesi',
    type: 'KONPARLAMENTO_TICKET_2026',
  });
}
