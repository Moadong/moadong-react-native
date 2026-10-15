import UIKit

// iOS 27 SDK부터 UIScene 생명주기가 필수라 추가한 얇은 어댑터.
// React Native는 AppDelegate가 띄운 window를 그대로 쓰고, URL 진입은 AppDelegate로 위임해
// firebaseauth 필터 → Expo 구독자(expo-linking, expo-router) → RCTLinkingManager 순서를 유지한다.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard
      let windowScene = scene as? UIWindowScene,
      let appWindow = (UIApplication.shared.delegate as? AppDelegate)?.window
    else {
      return
    }

    appWindow.windowScene = windowScene
    appWindow.makeKeyAndVisible()
    window = appWindow

    // Scene 생명주기에서는 cold start URL이 launchOptions가 아니라 connectionOptions로 들어온다.
    self.scene(scene, openURLContexts: connectionOptions.urlContexts)
    for userActivity in connectionOptions.userActivities {
      self.scene(scene, continue: userActivity)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
      return
    }

    for context in URLContexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
      if let sourceApplication = context.options.sourceApplication {
        options[.sourceApplication] = sourceApplication
      }
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: options)
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
      return
    }

    _ = appDelegate.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }
}
