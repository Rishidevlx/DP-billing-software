/**
 * Utility to handle E-Invoice API generation.
 * This is currently a mock implementation that simulates fetching from the Govt API.
 * In a real scenario, this would send a payload to your Node.js backend.
 */

export const generateEInvoice = async (billData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Check configuration
  const configStr = localStorage.getItem('einvoice_config');
  let config = { activeEnv: 'sandbox' };
  if (configStr) {
    try {
      config = JSON.parse(configStr);
    } catch (e) {
      console.error("Failed to parse einvoice config", e);
    }
  }

  const isProd = config.activeEnv === 'prod';
  const credentials = isProd ? config.prod : config.sandbox;

  // In a real app, you would check if credentials exist before proceeding:
  // if (!credentials?.clientId || !credentials?.clientSecret) {
  //   throw new Error("API credentials are not configured. Please check Settings.");
  // }

  // Mock Generation
  // Real IRN is a 64 character alphanumeric string
  const mockIrn = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  
  // Real Ack No is a 15 digit number
  const mockAckNo = Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
  
  // Format Date to: YYYY-MM-DD HH:mm:ss
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const mockAckDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // Real QR Code from govt is a signed JWT. We will just create a string that encodes some basic info for now.
  const qrData = JSON.stringify({
    SellerGstin: "33CAEPK4827P1ZC",
    BuyerGstin: billData?.customer?.gstin || "Unregistered",
    DocNo: billData?.billInfo?.billNo,
    DocDt: billData?.billInfo?.date,
    TotInvVal: billData?.totals?.netAmount,
    ItemCnt: billData?.items?.length,
    MainHsnCode: billData?.items?.[0]?.hsnCode || "4901",
    Irn: mockIrn
  });
  
  // Base64 encode the QR data to make it look a bit like the real signed QR string
  const mockQrCode = btoa(qrData);

  return {
    success: true,
    message: isProd ? "E-Invoice Generated Successfully (Production)" : "E-Invoice Generated Successfully (Sandbox)",
    data: {
      irn: mockIrn,
      ackNo: mockAckNo,
      ackDate: mockAckDate,
      qrCode: mockQrCode
    }
  };
};
