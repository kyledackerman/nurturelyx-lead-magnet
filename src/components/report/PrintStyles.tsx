const PrintStyles = () => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      @media print {
        body * {
          visibility: hidden;
        }
        
        #leadReport, #leadReport * {
          visibility: visible;
        }
        
        #leadReport {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        
        button {
          display: none !important;
        }
      }
    `,
      }}
    />
  );
};

export default PrintStyles;
