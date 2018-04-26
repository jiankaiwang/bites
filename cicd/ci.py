# -*- coding: utf-8 -*-
"""
Created on Wed Apr 25 16:27:55 2018
@author: acer4755g
"""

import REQUESTMETHOD2
import json
import sys
import os
import getopt
import logging
import subprocess

# help message
def helpMessgae():
    print("""Usage: python ci.py [options]
[options]
-u              the username, e.g. jiankaiwang (necessary)
-n              the repository name, e.g. umap (necessary)
-t              the travis token (necessary)
-p              the cd path (necessary)
-h, --help      the help message
    """)
    
# parse opts
def parseOpts(get_opts):
    return(dict((k,v) for k,v in get_opts))

def get_Travis_Repo_API(user, repo_name):
    travis_repo_api = REQUESTMETHOD2.SENDREQUEST(\
        "http://api.travis-ci.org/repos/{}/{}".format(user, repo_name), {}, {}, "GET")
    travis_repo_api_res = travis_repo_api.response()
    travis_repo_api_res_json = json.loads(travis_repo_api_res["response"])
    if "id" in travis_repo_api_res_json.keys():
        return travis_repo_api_res_json
    else:
        return {"id":"-1"}

def get_Travis_Repo_Build_API(repo_id, token):
    travis_ci_api = REQUESTMETHOD2.SENDREQUEST(\
        "https://api.travis-ci.org/repo/{}/builds?limit=1".format(repo_id), \
        {"Authorization" : "token {}".format(token)\
         ,"Travis-API-Version" : "3" \
         ,"User-Agent" : "API Explorer"}, \
        {}, "GET")

    travis_ci_api_res = travis_ci_api.response()
    travis_ci_api_res_json = json.loads(travis_ci_api_res["response"])
    if "builds" in travis_ci_api_res_json.keys():
        return travis_ci_api_res_json
    else:
        return {"sha":"-1"}    

def get_local_commit(getwd):
    os.chdir(getwd)
    bashCommand = "git rev-parse HEAD"
    logging.debug(bashCommand)
    try:  
        if sys.platform[0:3] == "win":
            process = subprocess.Popen(bashCommand, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
        elif sys.platform[0:3] == "lin":
            process = subprocess.Popen(bashCommand, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE, shell=True)
        output, error = process.communicate()
        logging.warning('Output:{},Error:{}'.format(output.decode('utf-8'), error.decode('utf-8')))
        return output.decode('utf-8')
    except:
        logging.warning("Can not get local master commit.")
        return "-1"

# main entry
logging.basicConfig(level=logging.WARNING)

opts, args = getopt.getopt(sys.argv[1:], "fhu:n:p:t:", ["help"])
opts = parseOpts(opts)

if len(opts) < 1:
    logging.debug("opts < 1")
    helpMessgae()
elif '--help' in opts.keys() or '-h' in opts.keys():
    logging.debug("opts exists help")
    helpMessgae()
else:
    if "-p" not in opts.keys() or len(opts["-p"]) < 1 or (not os.path.exists(opts["-p"])):
        logging.warning("No assigned respoitory.")
        sys.exit(1)
    if "-u" not in opts.keys() or len(opts["-u"]) < 1:
        logging.warning("No assigned username.")
        sys.exit(1)        
    if "-n" not in opts.keys() or len(opts["-n"]) < 1:
        logging.warning("No assigned repository.")
        sys.exit(1)
    if "-t" not in opts.keys() or len(opts["-t"]) < 1:
        logging.warning("No assigned travis token.")
        sys.exit(1)
    
    travis_repo_api_res_json = get_Travis_Repo_API(opts["-u"], opts["-n"])
    travis_repo_id = travis_repo_api_res_json["id"]
    if travis_repo_id == -1:
        logging.warning("No such repository in Travis.")
        sys.exit(1)
        
    travis_ci_api_res_json = get_Travis_Repo_Build_API(travis_repo_id, opts["-t"])
    travis_ci_api_sha, travis_ci_api_build = \
        travis_ci_api_res_json["builds"][0]["commit"]["sha"]\
        , travis_ci_api_res_json["builds"][0]["state"]
    if travis_ci_api_sha == -1:
        logging.warning("Token key is not allowed.")
        sys.exit(1)
    if travis_ci_api_build != "passed":
        logging.warning("CI build failed. Not to CD.")
        sys.exit(1)
    
    local_sha = get_local_commit(opts["-p"])
    if local_sha == -1:
        logging.warning("Can not get commit sha from local git repository.")
        sys.exit(1)
    else:
        if local_sha.strip() == travis_ci_api_sha.strip():
            logging.warning("Already the latest commit. No need to CD.")
            sys.exit(1)
        elif len(local_sha.strip()) < 1:
            logging.warning("No git found or no commit. Can's start CD.")
            sys.exit(1)
        sys.exit(0)
    

    











