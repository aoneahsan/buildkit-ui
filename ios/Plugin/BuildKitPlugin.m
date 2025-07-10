#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(BuildKitUIPlugin, "BuildKitUI",
    CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(trackEvent, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(trackError, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getPlatformInfo, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(setUserProperties, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startTrace, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopTrace, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(syncOfflineQueue, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getOfflineQueueStatus, CAPPluginReturnPromise);
)