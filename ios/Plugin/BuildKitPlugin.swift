import Foundation
import Capacitor

@objc(BuildKitUIPlugin)
public class BuildKitUIPlugin: CAPPlugin {
    private var sessionId: String = ""
    private var sessionStartTime: Date = Date()
    
    override public func load() {
        sessionId = UUID().uuidString
        sessionStartTime = Date()
    }
    
    @objc func initialize(_ call: CAPPluginCall) {
        // Initialize the plugin with configuration
        guard let config = call.getObject("config") else {
            call.reject("Configuration is required")
            return
        }
        
        // Initialize tracking, analytics, etc.
        setupTracking(config: config)
        
        call.resolve([
            "success": true
        ])
    }
    
    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let eventName = call.getString("eventName") else {
            call.reject("Event name is required")
            return
        }
        
        let parameters = call.getObject("parameters") ?? [:]
        let componentType = call.getString("componentType")
        
        // Track the event
        logEvent(name: eventName, parameters: parameters, componentType: componentType)
        
        call.resolve()
    }
    
    @objc func trackError(_ call: CAPPluginCall) {
        guard let message = call.getString("message") else {
            call.reject("Error message is required")
            return
        }
        
        let stack = call.getString("stack")
        let severity = call.getString("severity") ?? "error"
        let context = call.getObject("context") ?? [:]
        
        // Track the error
        logError(message: message, stack: stack, severity: severity, context: context)
        
        call.resolve()
    }
    
    @objc func getPlatformInfo(_ call: CAPPluginCall) {
        let device = UIDevice.current
        
        let platformInfo: [String: Any] = [
            "platform": "ios",
            "platformVersion": device.systemVersion,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
            "buildNumber": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown",
            "device": [
                "deviceId": device.identifierForVendor?.uuidString ?? "unknown",
                "model": device.model,
                "operatingSystem": device.systemName,
                "osVersion": device.systemVersion,
                "isSimulator": isSimulator()
            ],
            "network": getNetworkInfo(),
            "appState": [
                "isActive": UIApplication.shared.applicationState == .active,
                "sessionId": sessionId,
                "sessionStartTime": Int(sessionStartTime.timeIntervalSince1970 * 1000)
            ]
        ]
        
        call.resolve(platformInfo)
    }
    
    @objc func setUserProperties(_ call: CAPPluginCall) {
        guard let properties = call.getObject("properties") else {
            call.reject("Properties are required")
            return
        }
        
        // Store user properties
        UserDefaults.standard.set(properties, forKey: "buildkit_user_properties")
        
        call.resolve()
    }
    
    @objc func startTrace(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("Trace name is required")
            return
        }
        
        let traceId = UUID().uuidString
        // Start performance trace
        
        call.resolve([
            "traceId": traceId
        ])
    }
    
    @objc func stopTrace(_ call: CAPPluginCall) {
        guard let traceId = call.getString("traceId") else {
            call.reject("Trace ID is required")
            return
        }
        
        let metrics = call.getObject("metrics") ?? [:]
        // Stop trace and record metrics
        
        call.resolve()
    }
    
    // Helper methods
    
    private func setupTracking(config: [String: Any]) {
        // Initialize tracking system
        if let trackingConfig = config["tracking"] as? [String: Any] {
            if let isEnabled = trackingConfig["enabled"] as? Bool, isEnabled {
                // Set up tracking with platform context
                let platformInfo = getPlatformInfoDict()
                UserDefaults.standard.set(platformInfo, forKey: "buildkit_platform_info")
            }
        }
        
        // Initialize analytics providers if configured
        if let analyticsConfig = config["analytics"] as? [String: Any] {
            setupAnalyticsProviders(analyticsConfig)
        }
    }
    
    private func logEvent(name: String, parameters: [String: Any], componentType: String?) {
        // Log event to analytics providers
        var enrichedParams = parameters
        enrichedParams["sessionId"] = sessionId
        enrichedParams["timestamp"] = Int(Date().timeIntervalSince1970 * 1000)
        enrichedParams["platform"] = "ios"
        
        if let componentType = componentType {
            enrichedParams["componentType"] = componentType
        }
        
        // Add platform context
        if let platformInfo = UserDefaults.standard.dictionary(forKey: "buildkit_platform_info") {
            enrichedParams["device"] = platformInfo["device"]
            enrichedParams["appVersion"] = platformInfo["appVersion"]
        }
        
        // Log to console in debug mode
        #if DEBUG
        print("[BuildKitUI] Event: \(name), Params: \(enrichedParams)")
        #endif
        
        // Send to configured analytics providers
        NotificationCenter.default.post(
            name: Notification.Name("BuildKitUITrackEvent"),
            object: nil,
            userInfo: ["eventName": name, "parameters": enrichedParams]
        )
    }
    
    private func logError(message: String, stack: String?, severity: String, context: [String: Any]) {
        // Log error to error tracking providers
        var errorInfo: [String: Any] = [
            "message": message,
            "severity": severity,
            "timestamp": Int(Date().timeIntervalSince1970 * 1000),
            "sessionId": sessionId,
            "platform": "ios"
        ]
        
        if let stack = stack {
            errorInfo["stack"] = stack
        }
        
        // Add context
        errorInfo["context"] = context
        
        // Add platform info
        if let platformInfo = UserDefaults.standard.dictionary(forKey: "buildkit_platform_info") {
            errorInfo["device"] = platformInfo["device"]
            errorInfo["appVersion"] = platformInfo["appVersion"]
            errorInfo["osVersion"] = platformInfo["platformVersion"]
        }
        
        // Log to console
        print("[BuildKitUI] Error: \(message), Severity: \(severity)")
        
        // Send to configured error tracking providers
        NotificationCenter.default.post(
            name: Notification.Name("BuildKitUITrackError"),
            object: nil,
            userInfo: errorInfo
        )
    }
    
    private func getNetworkInfo() -> [String: Any] {
        // Get network information
        return [
            "isOnline": true,
            "connectionType": "wifi"
        ]
    }
    
    private func isSimulator() -> Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }
    
    private func getPlatformInfoDict() -> [String: Any] {
        let device = UIDevice.current
        
        return [
            "platform": "ios",
            "platformVersion": device.systemVersion,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
            "buildNumber": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown",
            "device": [
                "deviceId": device.identifierForVendor?.uuidString ?? "unknown",
                "model": device.model,
                "operatingSystem": device.systemName,
                "osVersion": device.systemVersion,
                "isSimulator": isSimulator()
            ]
        ]
    }
    
    private func setupAnalyticsProviders(_ config: [String: Any]) {
        // Set up analytics providers based on configuration
        if let providers = config["providers"] as? [String] {
            for provider in providers {
                switch provider {
                case "firebase":
                    // Initialize Firebase Analytics if available
                    NotificationCenter.default.post(
                        name: Notification.Name("BuildKitUIInitFirebase"),
                        object: nil,
                        userInfo: config
                    )
                case "amplitude":
                    // Initialize Amplitude if available
                    NotificationCenter.default.post(
                        name: Notification.Name("BuildKitUIInitAmplitude"),
                        object: nil,
                        userInfo: config
                    )
                default:
                    print("[BuildKitUI] Unknown analytics provider: \(provider)")
                }
            }
        }
    }
}