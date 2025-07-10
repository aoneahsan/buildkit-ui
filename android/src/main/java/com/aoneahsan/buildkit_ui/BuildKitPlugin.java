package com.aoneahsan.buildkit_ui;

import android.os.Build;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import com.getcapacitor.JSObject;
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
    }

    private void logEvent(String name, JSObject parameters, String componentType) {
        // Log event to analytics providers
    }

    private void logError(String message, String stack, String severity, JSObject context) {
        // Log error to error tracking providers
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