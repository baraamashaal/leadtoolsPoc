import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ImageCompressionTab } from './components/ImageCompression/ImageCompressionTab';
import { PdfCompressionTab } from './components/PdfCompression/PdfCompressionTab';
import { useToast } from './hooks/useToast';

function App() {
  const { toast, showSuccess, showError } = useToast();

  return (
    <div className="app-container">
      <Toast ref={toast} />

      <div className="header">
        <h1>🚀 LEADTOOLS Compression Suite</h1>
        <p>Professional-grade compression powered by LEADTOOLS SDK with advanced MRC technology</p>
      </div>

      <TabView>
        <TabPanel header="Image Compression" leftIcon="pi pi-image">
          <ImageCompressionTab
            onSuccess={showSuccess.bind(null, 'Success')}
            onError={showError.bind(null, 'Error')}
          />
        </TabPanel>

        <TabPanel header="PDF Compression (MRC)" leftIcon="pi pi-file-pdf">
          <PdfCompressionTab
            onSuccess={showSuccess.bind(null, 'Success')}
            onError={showError.bind(null, 'Error')}
          />
        </TabPanel>
      </TabView>
    </div>
  );
}

export default App;
