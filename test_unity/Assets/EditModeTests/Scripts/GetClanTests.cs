using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.TestTools;

namespace EditModeTests.Scripts
{
    [TestFixture]
    public class GetClanTests
    {
        [UnityTest]
        public IEnumerator GetClanAllTest()
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
            Assert.IsTrue(request.isDone);
            Assert.IsTrue(request.result == UnityWebRequest.Result.Success);
            var body = request.downloadHandler.text;
            Assert.IsFalse(string.IsNullOrWhiteSpace(body));
            
            Debug.Log($"test {request.responseCode} bytes {request.downloadedBytes}");
            Debug.Log($"test {body}");
            request.Dispose();
        }
    }
}