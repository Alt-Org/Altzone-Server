using System.Collections;
using System.Text;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.TestTools;

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
    public class GetClanTests
    {
        [UnityTest, Order(1)]
        public IEnumerator GetAllTest()
        {
            const string url = "http://localhost:8080/clan";
            Debug.Log($"test {url}");

            var request = UnityWebRequest.Get(url);
            var asyncOp = request.SendWebRequest();
            var asyncOpIsDone = false;
            asyncOp.completed += operation =>
            {
                Assert.IsTrue(operation.isDone);
                asyncOpIsDone = true;
            };
            yield return new WaitUntil(() => asyncOpIsDone);
            try
            {
                Debug.Log($"isDone {request.isDone} result {request.result} {request.responseCode}");

                Assert.IsTrue(request.isDone);
                Assert.IsTrue(request.result == UnityWebRequest.Result.Success);
                var body = request.downloadHandler?.text ?? string.Empty;
                Assert.IsFalse(string.IsNullOrWhiteSpace(body));

                Debug.Log($"test {request.responseCode} bytes {request.downloadedBytes}");
                Debug.Log($"body {body}");
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(2)]
        public IEnumerator GetByIdTest()
        {
            const string clanId = "6411cd209a79de3c1987b398";
            var url = $"http://localhost:8080/clan/{clanId}";
            Debug.Log($"test {url}");

            var request = UnityWebRequest.Get(url);
            var asyncOp = request.SendWebRequest();
            var asyncOpIsDone = false;
            asyncOp.completed += operation =>
            {
                Assert.IsTrue(operation.isDone);
                asyncOpIsDone = true;
            };
            yield return new WaitUntil(() => asyncOpIsDone);
            try
            {
                Debug.Log($"isDone {request.isDone} result {request.result} {request.responseCode}");

                Assert.IsTrue(request.isDone);
                Assert.IsTrue(request.result == UnityWebRequest.Result.Success);
                var body = request.downloadHandler?.text ?? string.Empty;
                Assert.IsFalse(string.IsNullOrWhiteSpace(body));

                Debug.Log($"test {request.responseCode} bytes {request.downloadedBytes}");
                Debug.Log($"body {body}");
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(3)]
        public IEnumerator CreateTest()
        {
            const string url = "http://localhost:8080/clan";
            Debug.Log($"test {url}");

            var postData = JsonQuotes("{'name':'TestClan','tag':'T','gameCoins':0}");
            Debug.Log($"POST {postData}");

            var bytes = Encoding.UTF8.GetBytes(postData);
            var request = UnityWebRequest.Put(url, bytes);
            request.method = "POST"; // Hack to send POST to server instead of PUT
            request.SetRequestHeader("Content-Type", "application/json");
            var asyncOp = request.SendWebRequest();
            var asyncOpIsDone = false;
            asyncOp.completed += operation =>
            {
                Assert.IsTrue(operation.isDone);
                asyncOpIsDone = true;
            };
            yield return new WaitUntil(() => asyncOpIsDone);
            try
            {
                Debug.Log($"isDone {request.isDone} result {request.result} {request.responseCode}");

                Assert.IsTrue(request.isDone);
                Assert.IsTrue(request.result == UnityWebRequest.Result.Success);
                var body = request.downloadHandler?.text ?? string.Empty;
                Assert.IsFalse(string.IsNullOrWhiteSpace(body));

                Debug.Log($"test {request.responseCode} bytes {request.downloadedBytes}");
                Debug.Log($"body {body}");
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(4)]
        public IEnumerator UpdateTest()
        {
            const string url = "http://localhost:8080/clan";
            Debug.Log($"test {url}");

            var putData = JsonQuotes("{'id':'6411cd209a79de3c1987b398','name':'TestClanUpdated','tag':'TU','gameCoins':1234}");
            Debug.Log($"PUT {putData}");

            var bytes = Encoding.UTF8.GetBytes(putData);
            var request = UnityWebRequest.Put(url, bytes);
            request.SetRequestHeader("Content-Type", "application/json");
            var asyncOp = request.SendWebRequest();
            var asyncOpIsDone = false;
            asyncOp.completed += operation =>
            {
                Assert.IsTrue(operation.isDone);
                asyncOpIsDone = true;
            };
            yield return new WaitUntil(() => asyncOpIsDone);
            try
            {
                Debug.Log($"isDone {request.isDone} result {request.result} {request.responseCode}");

                Assert.IsTrue(request.isDone);
                Assert.IsTrue(request.result == UnityWebRequest.Result.Success);
                // Body should be empty (null).
                var body = request.downloadHandler?.text ?? string.Empty;

                Debug.Log($"test {request.responseCode} bytes {request.downloadedBytes}");
                Debug.Log($"body {body}");
            }
            finally
            {
                request.Dispose();
            }
        }

        [UnityTest, Order(5)]
        public IEnumerator DeleteTest()
        {
            const string clanId = "6412c37d30369acf553817d3";
            var url = $"http://localhost:8080/clan/{clanId}";
            Debug.Log($"test {url}");

            var request = UnityWebRequest.Delete(url);
            var asyncOp = request.SendWebRequest();
            var asyncOpIsDone = false;
            asyncOp.completed += operation =>
            {
                Assert.IsTrue(operation.isDone);
                asyncOpIsDone = true;
            };
            yield return new WaitUntil(() => asyncOpIsDone);
            try
            {
                Debug.Log($"isDone {request.isDone} result {request.result} {request.responseCode}");

                Assert.IsTrue(request.isDone);
                Assert.IsTrue(request.result == UnityWebRequest.Result.Success);
                // Body should be empty (null).
                var body = request.downloadHandler?.text ?? string.Empty;

                Debug.Log($"test {request.responseCode} bytes {request.downloadedBytes}");
                Debug.Log($"body {body}");
            }
            finally
            {
                request.Dispose();
            }
        }

        /// <summary>
        /// Convenience method to convert single quotes to double quotes.
        /// </summary>
        private static string JsonQuotes(string jsonText)
        {
            return jsonText.Replace('\'', '"');
        }
    }
}