// Example React app using BuildKit UI components
// This demonstrates how to use the package in a real application

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  BuildKitProvider,
  ThemeProvider,
  TrackingProvider,
  ToastProvider,
  Button,
  Card,
  Input,
  Form,
  FormField,
  Dialog,
  Dropdown,
  Checkbox,
  RadioGroup,
  RadioButton,
  ProgressBar,
  Toast,
  DataTable,
  LoginPage,
  RegisterPage,
  ProfilePage,
  NotFoundPage,
  MaintenancePage,
  initializeTracking,
  trackEvent,
  themes
} from '../dist/plugin.cjs.js';

// Import styles
import '../dist/styles/buildkit-ui.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Example App Component
function ExampleApp() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    remember: false,
    theme: 'light'
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [progress, setProgress] = useState(30);
  const [selectedPage, setSelectedPage] = useState('components');

  // Sample data for DataTable
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    trackEvent('form_submitted', { form: 'example_form' });
    setToastMessage({
      severity: 'success',
      summary: 'Success',
      detail: 'Form submitted successfully!'
    });
  };

  const themeOptions = [
    { label: 'Light Theme', value: 'light' },
    { label: 'Dark Theme', value: 'dark' }
  ];

  return (
    <BuildKitProvider
      config={{
        analytics: { enabled: true },
        errorTracking: { enabled: true },
        tracking: { enabled: true }
      }}
    >
      <ThemeProvider defaultTheme="light">
        <TrackingProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
              <Toast />
              
              {/* Navigation */}
              <Card className="mb-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    label="Components Demo"
                    onClick={() => setSelectedPage('components')}
                    severity={selectedPage === 'components' ? 'primary' : 'secondary'}
                  />
                  <Button
                    label="Login Page"
                    onClick={() => setSelectedPage('login')}
                    severity={selectedPage === 'login' ? 'primary' : 'secondary'}
                  />
                  <Button
                    label="Register Page"
                    onClick={() => setSelectedPage('register')}
                    severity={selectedPage === 'register' ? 'primary' : 'secondary'}
                  />
                  <Button
                    label="Profile Page"
                    onClick={() => setSelectedPage('profile')}
                    severity={selectedPage === 'profile' ? 'primary' : 'secondary'}
                  />
                  <Button
                    label="404 Page"
                    onClick={() => setSelectedPage('404')}
                    severity={selectedPage === '404' ? 'primary' : 'secondary'}
                  />
                  <Button
                    label="Maintenance"
                    onClick={() => setSelectedPage('maintenance')}
                    severity={selectedPage === 'maintenance' ? 'primary' : 'secondary'}
                  />
                </div>
              </Card>

              {/* Page Content */}
              {selectedPage === 'components' && (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    BuildKit UI Example App
                  </h1>

                  {/* Form Example */}
                  <Card header="Form Components Example" className="mb-4">
                    <Form onSubmit={handleSubmit}>
                      <FormField label="Username" required>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Enter username"
                          trackingId="username-input"
                        />
                      </FormField>

                      <FormField label="Email" required>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email"
                          trackingId="email-input"
                        />
                      </FormField>

                      <FormField label="Password" required>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter password"
                          trackingId="password-input"
                        />
                      </FormField>

                      <FormField label="Theme">
                        <Dropdown
                          value={formData.theme}
                          options={themeOptions}
                          onChange={(e) => setFormData({ ...formData, theme: e.value })}
                          placeholder="Select theme"
                          trackingId="theme-dropdown"
                        />
                      </FormField>

                      <FormField>
                        <Checkbox
                          checked={formData.remember}
                          onChange={(e) => setFormData({ ...formData, remember: e.checked })}
                          trackingId="remember-checkbox"
                        />
                        <label className="ml-2">Remember me</label>
                      </FormField>

                      <div className="flex gap-2">
                        <Button type="submit" label="Submit" severity="primary" />
                        <Button
                          type="button"
                          label="Show Dialog"
                          severity="secondary"
                          onClick={() => setShowDialog(true)}
                        />
                      </div>
                    </Form>
                  </Card>

                  {/* Button Variants */}
                  <Card header="Button Variants" className="mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Button label="Primary" severity="primary" />
                      <Button label="Secondary" severity="secondary" />
                      <Button label="Success" severity="success" />
                      <Button label="Info" severity="info" />
                      <Button label="Warning" severity="warning" />
                      <Button label="Danger" severity="danger" />
                      <Button label="Help" severity="help" />
                    </div>
                    <div className="flex gap-2 flex-wrap mt-4">
                      <Button label="Small" size="small" />
                      <Button label="Medium" size="medium" />
                      <Button label="Large" size="large" />
                      <Button label="With Icon" icon="pi pi-check" />
                      <Button label="Loading" loading />
                      <Button label="Disabled" disabled />
                    </div>
                  </Card>

                  {/* Radio Group Example */}
                  <Card header="Radio Group Example" className="mb-4">
                    <RadioGroup name="options" value="option1">
                      <div className="mb-2">
                        <RadioButton inputId="opt1" value="option1" />
                        <label htmlFor="opt1" className="ml-2">Option 1</label>
                      </div>
                      <div className="mb-2">
                        <RadioButton inputId="opt2" value="option2" />
                        <label htmlFor="opt2" className="ml-2">Option 2</label>
                      </div>
                      <div className="mb-2">
                        <RadioButton inputId="opt3" value="option3" />
                        <label htmlFor="opt3" className="ml-2">Option 3</label>
                      </div>
                    </RadioGroup>
                  </Card>

                  {/* Progress Bar */}
                  <Card header="Progress Bar" className="mb-4">
                    <ProgressBar value={progress} />
                    <div className="mt-4 flex gap-2">
                      <Button
                        label="Decrease"
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                        severity="secondary"
                      />
                      <Button
                        label="Increase"
                        onClick={() => setProgress(Math.min(100, progress + 10))}
                        severity="primary"
                      />
                    </div>
                  </Card>

                  {/* Data Table */}
                  <Card header="Data Table Example" className="mb-4">
                    <DataTable
                      value={tableData}
                      trackingId="example-table"
                      paginator
                      rows={5}
                    >
                      <DataTable.Column field="id" header="ID" sortable />
                      <DataTable.Column field="name" header="Name" sortable />
                      <DataTable.Column field="email" header="Email" sortable />
                      <DataTable.Column field="role" header="Role" />
                    </DataTable>
                  </Card>

                  {/* Dialog */}
                  <Dialog
                    visible={showDialog}
                    onHide={() => setShowDialog(false)}
                    header="Example Dialog"
                    style={{ width: '50vw' }}
                    trackingId="example-dialog"
                  >
                    <p>This is an example dialog with BuildKit UI tracking.</p>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        label="Cancel"
                        severity="secondary"
                        onClick={() => setShowDialog(false)}
                      />
                      <Button
                        label="Confirm"
                        severity="primary"
                        onClick={() => {
                          setShowDialog(false);
                          setToastMessage({
                            severity: 'info',
                            summary: 'Confirmed',
                            detail: 'Dialog action confirmed!'
                          });
                        }}
                      />
                    </div>
                  </Dialog>
                </>
              )}

              {selectedPage === 'login' && <LoginPage />}
              {selectedPage === 'register' && <RegisterPage />}
              {selectedPage === 'profile' && (
                <ProfilePage
                  user={{
                    name: 'John Doe',
                    email: 'john@example.com',
                    avatar: 'https://via.placeholder.com/150'
                  }}
                />
              )}
              {selectedPage === '404' && <NotFoundPage />}
              {selectedPage === 'maintenance' && (
                <MaintenancePage estimatedTime="2 hours" />
              )}
            </div>
          </ToastProvider>
        </TrackingProvider>
      </ThemeProvider>
    </BuildKitProvider>
  );
}

// Initialize tracking
initializeTracking({
  userId: 'example-user-123',
  enableConsoleLogging: true
});

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ExampleApp />);