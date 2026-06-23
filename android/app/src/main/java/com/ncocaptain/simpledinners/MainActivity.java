package com.ncocaptain.simpledinners;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.BridgeActivity;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleSharedIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleSharedIntent(intent);
    }

    private void handleSharedIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        String type = intent.getType();

        if (!Intent.ACTION_SEND.equals(action)) return;
        if (type == null || !type.startsWith("text/")) return;

        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);

        if (sharedText == null || sharedText.trim().isEmpty()) return;

        String encodedSharedText = encode(sharedText.trim());

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (bridge == null || bridge.getWebView() == null) return;

            bridge
                .getWebView()
                .loadUrl(
                    "javascript:window.location.href='/cookbook?url="
                        + encodedSharedText
                        + "';"
                );
        }, 500);
    }

    private String encode(String value) {
        try {
            return URLEncoder.encode(value, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            return "";
        }
    }
}