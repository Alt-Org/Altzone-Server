using System;
using System.Collections;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.TestTools;
using Debug = UnityEngine.Debug;
using Random = UnityEngine.Random;

namespace EditModeTests.Scripts
{
    /// <summary>
    /// Simple REST API tests for <c>clan</c> end points.
    /// </summary>
    /// <remarks>
    /// create - router.post('/', validator.validateCreate, controller.create)<br />
    /// get by id - router.get('/:id', validator.validateRead, controller.get)<br />
    /// get all - router.get('/', controller.getAll)<br />
    /// update - router.put('/', validator.validateUpdate, controller.update)<br />
    /// delete - router.delete('/:id', validator.validateDelete, controller.delete)
    /// </remarks>
    [TestFixture]
    public class ClanTests
    {
        private static readonly bool IsSaveJson = true;

        [UnityTest, Order(1)]
        public IEnumerator T1_GetAllTest()
        {
            const string url = "http://localhost:8080/clan";
            Debug.Log($"test {url}");

            var request = UnityWebRequest.Get(url);
            try
            {
                yield return ExecuteRequest(request);

                var responseCode = (int)request.responseCode;
                var body = request.downloadHandler?.text ?? string.Empty;
                var hasBody = body.Length > 0;
                Debug.Log($"result {request.result} http {responseCode} body len {body.Length}");
                if (hasBody)
                {
                    Debug.Log($"body {body}");
                    SaveJson(request.method, url, responseCode, body);
                }
                var isValid = request.result is UnityWebRequest.Result.Success or UnityWebRequest.Result.ProtocolError;
                Assert.IsTrue(isValid);
                Assert.AreEqual((int)HttpStatusCode.OK, responseCode);
                Assert.IsTrue(hasBody);
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(2)]
        public IEnumerator T2_GetByIdTest()
        {
            const string clanId = "642972839323b99971e9eb1c";
            var url = $"http://localhost:8080/clan/{clanId}";
            Debug.Log($"test {url}");

            var request = UnityWebRequest.Get(url);
            try
            {
                yield return ExecuteRequest(request);

                var responseCode = (int)request.responseCode;
                var body = request.downloadHandler?.text ?? string.Empty;
                var hasBody = body.Length > 0;
                Debug.Log($"result {request.result} http {responseCode} body len {body.Length}");
                if (hasBody)
                {
                    Debug.Log($"body {body}");
                    SaveJson(request.method, url, responseCode, body);
                }
                var isValid = request.result is UnityWebRequest.Result.Success or UnityWebRequest.Result.ProtocolError;
                Assert.IsTrue(isValid);
                Assert.AreEqual((int)HttpStatusCode.OK, responseCode);
                Assert.IsTrue(hasBody);
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(3)]
        public IEnumerator T3_CreateTest()
        {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
            
            const string url = "http://localhost:8080/clan";
            Debug.Log($"test {url}");

            var postData = JsonQuotes("{'Id':'1','Name':'TestClan1','Tag':'T1','GameCoins':0}");
            Debug.Log($"POST {postData}");

            var bytes = Encoding.UTF8.GetBytes(postData);
            var request = UnityWebRequest.Put(url, bytes);
            request.method = "POST"; // Hack to send POST to server instead of PUT
            request.SetRequestHeader("Content-Type", "application/json");
            try
            {
                yield return ExecuteRequest(request);

                var responseCode = (int)request.responseCode;
                var body = request.downloadHandler?.text ?? string.Empty;
                var hasBody = body.Length > 0;
                Debug.Log($"result {request.result} http {responseCode} body len {body.Length}");
                if (hasBody)
                {
                    Debug.Log($"body {body}");
                    SaveJson(request.method, url, responseCode, body);
                }
                var isValid = request.result is UnityWebRequest.Result.Success or UnityWebRequest.Result.ProtocolError;
                Assert.IsTrue(isValid);
                Assert.AreEqual((int)HttpStatusCode.Created, responseCode);
                Assert.IsTrue(hasBody);
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(4)]
        public IEnumerator T4_UpdateTest()
        {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
            
            const string url = "http://localhost:8080/clan";
            Debug.Log($"test {url}");

            // Note! will return HTTP 400 Bad Request if trying to update without changing any data.
            const string clanId = "642972839323b99971e9eb1c";
            var tag = Convert.ToChar(Random.Range('A', 'Z' + 1));
            var coins = Random.Range(1, 100);
            var putData = JsonQuotes($"{{'_id':'{clanId}','Name':'TestClanUpdated','Tag':'[{tag}]','GameCoins':{coins}}}");
            Debug.Log($"PUT {putData}");

            var bytes = Encoding.UTF8.GetBytes(putData);
            var request = UnityWebRequest.Put(url, bytes);
            request.SetRequestHeader("Content-Type", "application/json");
            try
            {
                yield return ExecuteRequest(request);

                var responseCode = (int)request.responseCode;
                var body = request.downloadHandler?.text ?? string.Empty;
                var hasBody = body.Length > 0;
                Debug.Log($"result {request.result} http {responseCode} body len {body.Length}");
                if (hasBody)
                {
                    Debug.Log($"body {body}");
                    SaveJson(request.method, url, responseCode, body);
                }
                var isValid = request.result is UnityWebRequest.Result.Success or UnityWebRequest.Result.ProtocolError;
                Assert.IsTrue(isValid);
                var isOk = responseCode is (int)HttpStatusCode.OK or (int)HttpStatusCode.NoContent;
                Assert.IsTrue(isOk);
                // Body should be empty (null).
                Assert.IsFalse(hasBody);
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(5)]
        public IEnumerator T5_DeleteTest()
        {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
            
            const string clanId = "6429720b9323b99971e9eb15";
            var url = $"http://localhost:8080/clan/{clanId}";
            Debug.Log($"test {url}");

            var request = UnityWebRequest.Delete(url);
            try
            {
                yield return ExecuteRequest(request);

                var responseCode = (int)request.responseCode;
                var body = request.downloadHandler?.text ?? string.Empty;
                var hasBody = body.Length > 0;
                Debug.Log($"result {request.result} http {responseCode} body len {body.Length}");
                if (hasBody)
                {
                    Debug.Log($"body {body}");
                    SaveJson(request.method, url, responseCode, body);
                }
                var isValid = request.result is UnityWebRequest.Result.Success or UnityWebRequest.Result.ProtocolError;
                Assert.IsTrue(isValid);
                Assert.AreEqual((int)HttpStatusCode.NoContent, responseCode);
                // Body should be empty (null).
                Assert.IsFalse(hasBody);
            }
            finally
            {
                request.Dispose();
            }
        }

        /// <summary>
        /// Convenience method to start async operation and wait until it is done.
        /// </summary>
        /// <remarks>
        /// Request result should be <c>Success</c> or <c>ProtocolError</c> in most cases when server can be reached.
        /// </remarks>
        private static CustomYieldInstruction ExecuteRequest(UnityWebRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            AsyncOperation asyncOperation = null;
            request.SendWebRequest().completed += operation =>
            {
                asyncOperation = operation;
                stopwatch.Stop();
                Debug.Log($"{request.method} {request.url} took {stopwatch.ElapsedMilliseconds} ms");
            };
            return new WaitUntil(() => asyncOperation is { isDone: true });
        }

        /// <summary>
        /// Convenience method to convert single quotes to double quotes.
        /// </summary>
        private static string JsonQuotes(string jsonText)
        {
            return jsonText.Replace('\'', '"');
        }

        private static void SaveJson(string method, string url, int httpStatus, string json)
        {
            if (!IsSaveJson)
            {
                return;
            }
            url = url.Replace("http://", string.Empty);
            url = url.Replace("https://", string.Empty);
            url = url.Replace(':', '_');
            url = url.Replace('/', '_');
            url = url.Replace('?', '_');
            url = url.Replace('&', '_');
            var filename = Path.Combine(Application.persistentDataPath, $"{method.ToLower()}_{url}_{httpStatus}.json");
            File.WriteAllText(filename, json);
            Debug.Log($"wrote {filename} {json.Length} chars");
        }
    }
}