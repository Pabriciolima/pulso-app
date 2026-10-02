package com.pabriciolima.pulso;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.print.PrintManager;
import android.webkit.*;
import android.widget.*;
import android.view.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class MainActivity extends Activity {
 private static final String HOST="appassets.androidplatform.net";
 private static final int SAVE_CSV=42;
 private WebView web;
 private String csv;
 private boolean exiting;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(Color.rgb(255,249,252));
  web=new WebView(this);root.addView(web,new LinearLayout.LayoutParams(-1,-1));setContentView(root);
  root.setOnApplyWindowInsetsListener((v,i)->{v.setPadding(i.getSystemWindowInsetLeft(),i.getSystemWindowInsetTop(),i.getSystemWindowInsetRight(),i.getSystemWindowInsetBottom());return i.consumeSystemWindowInsets();});
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setSafeBrowsingEnabled(true);s.setSupportMultipleWindows(false);s.setMediaPlaybackRequiresUserGesture(true);s.setUserAgentString(s.getUserAgentString()+" PulsoAndroid/1.0");
  web.setBackgroundColor(Color.rgb(255,249,252));
  CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  web.addJavascriptInterface(new AndroidActions(),"PulsoAndroid");
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){
    Uri u=r.getUrl();if(!HOST.equals(u.getHost()))return null;
    String path=u.getPath();
    if(!"https".equals(u.getScheme())||path==null||!path.startsWith("/assets/www/")||path.contains(".."))return missing();
    String name=path.substring("/assets/".length());
    try{
     String ext=name.substring(name.lastIndexOf('.')+1).toLowerCase(Locale.ROOT);
     String mime=ext.equals("js")||ext.equals("mjs")?"text/javascript":ext.equals("svg")?"image/svg+xml":ext.equals("html")?"text/html":ext.equals("css")?"text/css":ext.equals("gif")?"image/gif":ext.equals("webmanifest")?"application/manifest+json":"application/octet-stream";
     Map<String,String> headers=new HashMap<>();headers.put("Cache-Control","no-store");headers.put("X-Content-Type-Options","nosniff");
     headers.put("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'none'; base-uri 'self'; form-action 'self'");
     return new WebResourceResponse(mime,"UTF-8",200,"OK",headers,getAssets().open(name));
    }catch(IOException e){return missing();}
   }
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){
    Uri u=r.getUrl();if(HOST.equals(u.getHost())&&"https".equals(u.getScheme()))return false;
    if(!r.isForMainFrame())return true;
    if(Arrays.asList("https","tel","mailto").contains(u.getScheme())){try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(ActivityNotFoundException e){message("Não há aplicativo para abrir este endereço.");}}return true;
   }
   @Override public void onPageFinished(WebView v,String url){v.evaluateJavascript("window.dispatchEvent(new Event('focus'))",null);}
   @Override public void onReceivedSslError(WebView v,android.webkit.SslErrorHandler h,android.net.http.SslError e){h.cancel();message("Não foi possível validar a conexão segura. Confira sua internet.");}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onJsAlert(WebView v,String url,String text,JsResult result){new AlertDialog.Builder(MainActivity.this).setMessage(text).setPositiveButton("OK",(d,w)->result.confirm()).setOnCancelListener(d->result.cancel()).show();return true;}
   @Override public boolean onJsConfirm(WebView v,String url,String text,JsResult result){new AlertDialog.Builder(MainActivity.this).setMessage(text).setPositiveButton("Continuar",(d,w)->result.confirm()).setNegativeButton("Cancelar",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;}
  });
  web.loadUrl("https://"+HOST+"/assets/www/index.html");
 }
 private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 private void message(String text){runOnUiThread(()->Toast.makeText(this,text,Toast.LENGTH_LONG).show());}
 public class AndroidActions {
  @JavascriptInterface public void printReport(){runOnUiThread(()->{PrintManager p=(PrintManager)getSystemService(PRINT_SERVICE);p.print("Pulso - diário de pressão",web.createPrintDocumentAdapter("Pulso"),null);});}
  @JavascriptInterface public void saveCsv(String content){if(content==null||content.length()>2000000){message("Relatório muito grande.");return;}runOnUiThread(()->{csv=content;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("text/csv").putExtra(Intent.EXTRA_TITLE,"Pulso-registros.csv");try{startActivityForResult(i,SAVE_CSV);}catch(ActivityNotFoundException e){csv=null;message("Não foi possível abrir o seletor de arquivos.");}});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==SAVE_CSV){String text=csv;csv=null;if(result==RESULT_OK&&data!=null&&data.getData()!=null&&text!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){if(out==null)throw new IOException();out.write(text.getBytes(StandardCharsets.UTF_8));message("Planilha salva 💜");}catch(IOException e){message("Não foi possível salvar. Tente novamente.");}}}}
 @Override public void onBackPressed(){web.evaluateJavascript("(function(){let d=document.querySelector('dialog[open]');if(d){d.close();return 'closed'}if(location.hash!=='#inicio'){document.querySelector('[data-view=inicio]').click();return 'home'}return 'exit'})()",value->{if("\"exit\"".equals(value)&&!exiting){exiting=true;new AlertDialog.Builder(this).setMessage("Fechar o Pulso?").setPositiveButton("Fechar",(d,w)->finish()).setNegativeButton("Ficar",(d,w)->exiting=false).setOnCancelListener(d->exiting=false).show();}});}
 @Override protected void onPause(){web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("window.dispatchEvent(new Event('focus'))",null);}}
 @Override protected void onDestroy(){if(web!=null){web.removeJavascriptInterface("PulsoAndroid");web.destroy();}super.onDestroy();}
}
