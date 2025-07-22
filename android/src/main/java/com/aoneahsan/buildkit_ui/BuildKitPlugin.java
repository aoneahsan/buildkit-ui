package com.aoneahsan.buildkit_ui;

import android.os.Build;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.UUID;

@CapacitorPlugin(name = "BuildKitUI")
public class BuildKitPlugin extends Plugin {
    private String sessionId = "";
    private long sessionStartTime = 0;

    @Override
    public void load() {
        sessionId = UUID.randomUUID().toString();
        sessionStartTime = System.currentTimeMillis();
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        JSObject config = call.getObject("config");
        if (config == null) {
            call.reject("Configuration is required");
            return;
        }

        // Initialize tracking, analytics, etc.
        setupTracking(config);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void trackEvent(PluginCall call) {
        String eventName = call.getString("eventName");
        if (eventName == null) {
            call.reject("Event name is required");
            return;
        }

        JSObject parameters = call.getObject("parameters", new JSObject());
        String componentType = call.getString("componentType");

        // Track the event
        logEvent(eventName, parameters, componentType);

        call.resolve();
    }

    @PluginMethod
    public void trackError(PluginCall call) {
        String message = call.getString("message");
        if (message == null) {
            call.reject("Error message is required");
            return;
        }

        String stack = call.getString("stack");
        String severity = call.getString("severity", "error");
        JSObject context = call.getObject("context", new JSObject());

        // Track the error
        logError(message, stack, severity, context);

        call.resolve();
    }

    @PluginMethod
    public void getPlatformInfo(PluginCall call) {
        Context context = getContext();
        
        JSObject deviceInfo = new JSObject();
        deviceInfo.put("deviceId", getDeviceId());
        deviceInfo.put("model", Build.MODEL);
        deviceInfo.put("manufacturer", Build.MANUFACTURER);
        deviceInfo.put("operatingSystem", "Android");
        deviceInfo.put("osVersion", Build.VERSION.RELEASE);
        deviceInfo.put("isSimulator", isEmulator());

        JSObject networkInfo = getNetworkInfo();

        JSObject appState = new JSObject();
        appState.put("isActive", true);
        appState.put("sessionId", sessionId);
        appState.put("sessionStartTime", sessionStartTime);

        JSObject platformInfo = new JSObject();
        platformInfo.put("platform", "android");
        platformInfo.put("platformVersion", Build.VERSION.RELEASE);
        platformInfo.put("appVersion", getAppVersion());
        platformInfo.put("buildNumber", getBuildNumber());
        platformInfo.put("device", deviceInfo);
        platformInfo.put("network", networkInfo);
        platformInfo.put("appState", appState);

        call.resolve(platformInfo);
    }

    @PluginMethod
    public void setUserProperties(PluginCall call) {
        JSObject properties = call.getObject("properties");
        if (properties == null) {
            call.reject("Properties are required");
            return;
        }

        // Store user properties
        // Implementation depends on your storage preference

        call.resolve();
    }

    @PluginMethod
    public void startTrace(PluginCall call) {
        String name = call.getString("name");
        if (name == null) {
            call.reject("Trace name is required");
            return;
        }

        String traceId = UUID.randomUUID().toString();
        // Start performance trace

        JSObject ret = new JSObject();
        ret.put("traceId", traceId);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopTrace(PluginCall call) {
        String traceId = call.getString("traceId");
        if (traceId == null) {
            call.reject("Trace ID is required");
            return;
        }

        JSObject metrics = call.getObject("metrics", new JSObject());
        // Stop trace and record metrics

        call.resolve();
    }

    // Helper methods

    private void setupTracking(JSObject config) {
        // Initialize tracking system
        JSObject trackingConfig = config.getJSObject("tracking");
        if (trackingConfig != null && trackingConfig.getBool("enabled", true)) {
            // Set up tracking with platform context
            JSObject platformInfo = getPlatformInfoObject();
            // Store platform info for later use
            getContext().getSharedPreferences("buildkit_ui", Context.MODE_PRIVATE)
                .edit()
                .putString("platform_info", platformInfo.toString())
                .apply();
        }
        
        // Initialize analytics providers if configured
        JSObject analyticsConfig = config.getJSObject("analytics");
        if (analyticsConfig != null) {
            setupAnalyticsProviders(analyticsConfig);
        }
    }

    private void logEvent(String name, JSObject parameters, String componentType) {
        // Log event to analytics providers
        JSObject enrichedParams = new JSObject();
        
        // Copy existing parameters
        if (parameters != null) {
            for (String key : parameters.keys()) {
                enrichedParams.put(key, parameters.get(key));
            }
        }
        
        // Add tracking metadata
        enrichedParams.put("sessionId", sessionId);
        enrichedParams.put("timestamp", System.currentTimeMillis());
        enrichedParams.put("platform", "android");
        
        if (componentType != null) {
            enrichedParams.put("componentType", componentType);
        }
        
        // Add platform context
        try {
            JSObject deviceInfo = new JSObject();
            deviceInfo.put("model", Build.MODEL);
            deviceInfo.put("manufacturer", Build.MANUFACTURER);
            enrichedParams.put("device", deviceInfo);
            enrichedParams.put("appVersion", getAppVersion());
        } catch (Exception e) {
            // Ignore context errors
        }
        
        // Log to console in debug mode
        if (BuildConfig.DEBUG) {
            android.util.Log.d("BuildKitUI", "Event: " + name + ", Params: " + enrichedParams.toString());
        }
        
        // Send to configured analytics providers
        android.content.Intent intent = new android.content.Intent("com.buildkit.ui.TRACK_EVENT");
        intent.putExtra("eventName", name);
        intent.putExtra("parameters", enrichedParams.toString());
        getContext().sendBroadcast(intent);
    }

    private void logError(String message, String stack, String severity, JSObject context) {
        // Log error to error tracking providers
        JSObject errorInfo = new JSObject();
        errorInfo.put("message", message);
        errorInfo.put("severity", severity);
        errorInfo.put("timestamp", System.currentTimeMillis());
        errorInfo.put("sessionId", sessionId);
        errorInfo.put("platform", "android");
        
        if (stack != null) {
            errorInfo.put("stack", stack);
        }
        
        // Add context
        if (context != null) {
            errorInfo.put("context", context);
        }
        
        // Add platform info
        try {
            JSObject deviceInfo = new JSObject();
            deviceInfo.put("model", Build.MODEL);
            deviceInfo.put("osVersion", Build.VERSION.RELEASE);
            errorInfo.put("device", deviceInfo);
            errorInfo.put("appVersion", getAppVersion());
        } catch (Exception e) {
            // Ignore context errors
        }
        
        // Log to console
        android.util.Log.e("BuildKitUI", "Error: " + message + ", Severity: " + severity);
        
        // Send to configured error tracking providers
        android.content.Intent intent = new android.content.Intent("com.buildkit.ui.TRACK_ERROR");
        intent.putExtra("errorInfo", errorInfo.toString());
        getContext().sendBroadcast(intent);
    }

    private JSObject getPlatformInfoObject() {
        Context context = getContext();
        
        JSObject deviceInfo = new JSObject();
        deviceInfo.put("deviceId", getDeviceId());
        deviceInfo.put("model", Build.MODEL);
        deviceInfo.put("manufacturer", Build.MANUFACTURER);
        deviceInfo.put("operatingSystem", "Android");
        deviceInfo.put("osVersion", Build.VERSION.RELEASE);
        deviceInfo.put("isSimulator", isEmulator());

        JSObject networkInfo = getNetworkInfo();

        JSObject appState = new JSObject();
        appState.put("isActive", true);
        appState.put("sessionId", sessionId);
        appState.put("sessionStartTime", sessionStartTime);

        JSObject platformInfo = new JSObject();
        platformInfo.put("platform", "android");
        platformInfo.put("platformVersion", Build.VERSION.RELEASE);
        platformInfo.put("appVersion", getAppVersion());
        platformInfo.put("buildNumber", getBuildNumber());
        platformInfo.put("device", deviceInfo);
        platformInfo.put("network", networkInfo);
        platformInfo.put("appState", appState);

        return platformInfo;
    }

    private void setupAnalyticsProviders(JSObject config) {
        // Set up analytics providers based on configuration
        try {
            JSArray providers = config.getJSONArray("providers");
            if (providers != null) {
                for (int i = 0; i < providers.length(); i++) {
                    String provider = providers.getString(i);
                    switch (provider) {
                        case "firebase":
                            // Initialize Firebase Analytics if available
                            android.content.Intent firebaseIntent = new android.content.Intent("com.buildkit.ui.INIT_FIREBASE");
                            firebaseIntent.putExtra("config", config.toString());
                            getContext().sendBroadcast(firebaseIntent);
                            break;
                        case "amplitude":
                            // Initialize Amplitude if available
                            android.content.Intent amplitudeIntent = new android.content.Intent("com.buildkit.ui.INIT_AMPLITUDE");
                            amplitudeIntent.putExtra("config", config.toString());
                            getContext().sendBroadcast(amplitudeIntent);
                            break;
                        case "clarity":
                            // Initialize Clarity if available
                            android.content.Intent clarityIntent = new android.content.Intent("com.buildkit.ui.INIT_CLARITY");
                            clarityIntent.putExtra("config", config.toString());
                            getContext().sendBroadcast(clarityIntent);
                            break;
                        default:
                            android.util.Log.d("BuildKitUI", "Unknown analytics provider: " + provider);
                    }
                }
            }
        } catch (Exception e) {
            android.util.Log.e("BuildKitUI", "Error setting up analytics providers", e);
        }
    }

    private JSObject getNetworkInfo() {
        ConnectivityManager cm = (ConnectivityManager) getContext().getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        
        JSObject networkInfo = new JSObject();
        networkInfo.put("isOnline", activeNetwork != null && activeNetwork.isConnectedOrConnecting());
        
        if (activeNetwork != null) {
            String connectionType = "unknown";
            if (activeNetwork.getType() == ConnectivityManager.TYPE_WIFI) {
                connectionType = "wifi";
            } else if (activeNetwork.getType() == ConnectivityManager.TYPE_MOBILE) {
                connectionType = "cellular";
            }
            networkInfo.put("connectionType", connectionType);
        }
        
        return networkInfo;
    }

    private String getDeviceId() {
        // Implementation for getting device ID
        return UUID.randomUUID().toString();
    }

    private boolean isEmulator() {
        return Build.FINGERPRINT.startsWith("generic")
            || Build.FINGERPRINT.startsWith("unknown")
            || Build.MODEL.contains("google_sdk")
            || Build.MODEL.contains("Emulator")
            || Build.MODEL.contains("Android SDK built for x86");
    }

    private String getAppVersion() {
        try {
            return getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String getBuildNumber() {
        try {
            return String.valueOf(getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0).versionCode);
        } catch (Exception e) {
            return "unknown";
        }
    }
}