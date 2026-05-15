export function generateOtpTable(otp: string) {
  const digits = otp
    .split('')
    .map(
      (digit) =>
        `<span style="
        display: inline-block;
        width: 40px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        border: 1px solid #000000;
        border-radius: 8px;
        margin: 0 4px;
        font-size: 24px;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        color: #000000;
        background-color: #f9f9f9;
      ">${digit}</span>`,
    )
    .join('');

  return `
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; user-select: all; cursor: pointer;" onclick="navigator.clipboard.writeText('${otp}')">
        <div style="font-size: 0; white-space: nowrap;">
          ${digits}
        </div>
      </div>
      <p style="font-family: sans-serif; font-size: 12px; color: #666; margin-top: 10px;">
        Double click to copy the code
      </p>
    </div>
  `;
}
